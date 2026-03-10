import { getLLM } from '../llm/client.js';
import type { Chapter, StoryBible } from '../types/index.js';
import type { StoryStructuredState } from '../story/structuredState.js';
import type { CanonStore, CanonFact } from '../memory/canonStore.js';
import { ConstraintGraph, type ConstraintViolation } from './constraintGraph.js';

export interface ValidationResult {
  valid: boolean;
  violations: ConstraintViolation[];
  summary: string;
}

export interface ChapterValidationContext {
  chapter: Chapter;
  bible: StoryBible;
  structuredState: StoryStructuredState;
  canon: CanonStore;
  previousChapters: Chapter[];
  constraintGraph: ConstraintGraph;
}

const VALIDATOR_PROMPT = `You are a narrative validator. Check this chapter for consistency issues.

## Story Bible

**Title:** {{title}}
**Setting:** {{setting}}

## Canon Facts (must never be violated)
{{canon}}

## Current Story State

**Chapter:** {{chapterNumber}}

### Character States
{{characters}}

### Plot Threads
{{plotThreads}}

## Chapter to Validate

**Title:** {{chapterTitle}}

{{chapterContent}}

## Your Task

Check for these types of errors:

1. **Canon Violations**: Does the chapter contradict any established facts?
2. **Character Consistency**: Do characters act according to their established personality?
3. **Location Errors**: Are characters in places they couldn't be? Is travel time realistic?
4. **Knowledge Leaks**: Do characters know things they shouldn't know yet?
5. **Timeline Errors**: Are events in the right order?
6. **Logic Errors**: Any impossible or contradictory situations?

Output JSON:
{
  "valid": true/false,
  "violations": [
    {
      "type": "canon|character|location|knowledge|timeline|logic",
      "severity": "error|warning",
      "description": "Detailed description of the issue",
      "suggestedFix": "How to fix this issue"
    }
  ],
  "summary": "Overall assessment of chapter consistency"
}`;

export class Validator {
  private constraintGraph: ConstraintGraph;
  
  constructor(constraintGraph?: ConstraintGraph) {
    this.constraintGraph = constraintGraph || new ConstraintGraph();
  }
  
  /**
   * Validate a chapter using both graph-based and LLM-based checks
   */
  async validateChapter(context: ChapterValidationContext): Promise<ValidationResult> {
    const { chapter, bible, structuredState, canon, constraintGraph } = context;
    
    // Graph-based validation
    const graphViolations = constraintGraph.checkConstraints(chapter.number);
    
    // LLM-based validation
    let llmViolations: ConstraintViolation[] = [];
    try {
      llmViolations = await this.llmValidate(context);
    } catch (error) {
      // If LLM fails, rely on graph validation only
      console.log('LLM validation failed, using graph validation only');
    }
    
    // Combine violations
    const allViolations = [...graphViolations, ...llmViolations];
    
    // Remove duplicates (same description)
    const uniqueViolations = allViolations.filter((v, i, a) => 
      a.findIndex(t => t.description === v.description) === i
    );
    
    // Generate summary
    const errorCount = uniqueViolations.filter(v => v.severity === 'error').length;
    const warningCount = uniqueViolations.filter(v => v.severity === 'warning').length;
    
    let summary: string;
    if (errorCount === 0 && warningCount === 0) {
      summary = 'Chapter is consistent with story canon and state.';
    } else if (errorCount === 0) {
      summary = `Chapter has ${warningCount} warning(s) but no critical errors.`;
    } else {
      summary = `Chapter has ${errorCount} error(s) and ${warningCount} warning(s) that need attention.`;
    }
    
    return {
      valid: errorCount === 0,
      violations: uniqueViolations,
      summary,
    };
  }
  
  /**
   * LLM-based validation
   */
  private async llmValidate(context: ChapterValidationContext): Promise<ConstraintViolation[]> {
    const { chapter, bible, structuredState, canon } = context;
    
    const prompt = VALIDATOR_PROMPT
      .replace('{{title}}', bible.title)
      .replace('{{setting}}', bible.setting)
      .replace('{{canon}}', this.formatCanon(canon))
      .replace('{{chapterNumber}}', chapter.number.toString())
      .replace('{{characters}}', this.formatCharacters(structuredState))
      .replace('{{plotThreads}}', this.formatPlotThreads(structuredState))
      .replace('{{chapterTitle}}', chapter.title)
      .replace('{{chapterContent}}', chapter.content.substring(0, 4000));
    
    const result = await getLLM().completeJSON<ValidationResult>(prompt, {
      temperature: 0.3,
      maxTokens: 1500,
    });
    
    return result.violations;
  }
  
  /**
   * Quick validation without LLM (for testing/fallback)
   */
  quickValidate(context: ChapterValidationContext): ValidationResult {
    const { chapter, canon, constraintGraph } = context;
    
    // Graph-based validation only
    const violations = constraintGraph.checkConstraints(chapter.number);
    
    // Basic canon check
    const canonViolations = this.checkCanonBasic(chapter, canon);
    
    const allViolations = [...violations, ...canonViolations];
    const errorCount = allViolations.filter(v => v.severity === 'error').length;
    
    return {
      valid: errorCount === 0,
      violations: allViolations,
      summary: errorCount === 0 
        ? 'Chapter passes basic validation.' 
        : `Found ${errorCount} error(s) in basic validation.`,
    };
  }
  
  /**
   * Basic canon check (keyword matching)
   */
  private checkCanonBasic(chapter: Chapter, canon: CanonStore): ConstraintViolation[] {
    const violations: ConstraintViolation[] = [];
    const content = chapter.content.toLowerCase();
    
    for (const fact of canon.facts) {
      // Check for contradictions (simplified)
      // If fact says "X is Y", check for "X is not Y" or "X was never Y"
      const subject = fact.subject.toLowerCase();
      const value = fact.value.toLowerCase();
      
      // Look for negations
      const negationPatterns = [
        `${subject}.*不是.*${value}`,
        `${subject}.*从未.*${value}`,
        `${subject}.*不再.*${value}`,
      ];
      
      for (const pattern of negationPatterns) {
        const regex = new RegExp(pattern);
        if (regex.test(content)) {
          violations.push({
            type: 'canon',
            severity: 'error',
            description: `Canon violation: "${fact.subject} ${fact.attribute} = ${fact.value}" is contradicted`,
            nodes: [],
            suggestedFix: `Ensure ${fact.subject} remains ${fact.value} as established in chapter ${fact.chapterEstablished}`,
          });
        }
      }
    }
    
    return violations;
  }
  
  /**
   * Format canon for prompt
   */
  private formatCanon(canon: CanonStore): string {
    if (canon.facts.length === 0) return 'No canon facts established.';
    
    return canon.facts
      .map(f => `- ${f.subject} ${f.attribute} = ${f.value} (est. Ch ${f.chapterEstablished})`)
      .join('\n');
  }
  
  /**
   * Format characters for prompt
   */
  private formatCharacters(state: StoryStructuredState): string {
    return Object.values(state.characters)
      .map(c => `- ${c.name}: ${c.emotionalState}, at ${c.location}`)
      .join('\n') || 'No characters.';
  }
  
  /**
   * Format plot threads for prompt
   */
  private formatPlotThreads(state: StoryStructuredState): string {
    return Object.values(state.plotThreads)
      .filter(t => t.status !== 'resolved')
      .map(t => `- ${t.name} (${t.status}, ${Math.round(t.tension * 100)}% tension)`)
      .join('\n') || 'No active plot threads.';
  }
  
  /**
   * Format validation result for display
   */
  formatResult(result: ValidationResult): string {
    const lines: string[] = [];
    
    lines.push(`**Validation Result:** ${result.valid ? '✅ VALID' : '❌ INVALID'}`);
    lines.push(`**Summary:** ${result.summary}`);
    
    if (result.violations.length > 0) {
      lines.push('\n**Violations:**');
      
      const errors = result.violations.filter(v => v.severity === 'error');
      const warnings = result.violations.filter(v => v.severity === 'warning');
      
      if (errors.length > 0) {
        lines.push('\n*Errors:*');
        for (const v of errors) {
          lines.push(`❌ [${v.type.toUpperCase()}] ${v.description}`);
          if (v.suggestedFix) {
            lines.push(`   💡 Fix: ${v.suggestedFix}`);
          }
        }
      }
      
      if (warnings.length > 0) {
        lines.push('\n*Warnings:*');
        for (const v of warnings) {
          lines.push(`⚠️ [${v.type.toUpperCase()}] ${v.description}`);
        }
      }
    }
    
    return lines.join('\n');
  }
  
  /**
   * Get the constraint graph
   */
  getConstraintGraph(): ConstraintGraph {
    return this.constraintGraph;
  }
}

export const validator = new Validator();
