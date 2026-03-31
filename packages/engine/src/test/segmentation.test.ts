import { describe, it, expect } from 'vitest';

// 模拟 memoryExtractor 的分段逻辑
class TestSegmenter {
  private readonly SEGMENT_SIZE = 4000;
  private readonly SEGMENT_OVERLAP = 200;

  segmentContent(content: string): string[] {
    const segments: string[] = [];
    let start = 0;
    let segmentIndex = 0;

    while (start < content.length) {
      segmentIndex++;
      const segment = this.getNextSegment(content, start);
      segments.push(segment);
      
      // Move start position, accounting for overlap
      // Ensure we make at least (SEGMENT_SIZE - OVERLAP) progress to avoid infinite loop
      const minAdvance = this.SEGMENT_SIZE - this.SEGMENT_OVERLAP;
      start = start + Math.max(segment.length - this.SEGMENT_OVERLAP, minAdvance);
      
      // 防止无限循环的安全检查
      if (segmentIndex > 20) {
        throw new Error(`Too many segments (${segmentIndex}), possible infinite loop`);
      }
    }

    return segments;
  }

  private getNextSegment(content: string, start: number): string {
    const end = Math.min(start + this.SEGMENT_SIZE, content.length);
    
    // Try to break at a paragraph boundary
    let breakPoint = end;
    if (end < content.length) {
      // Look for paragraph break within 200 chars of the target end
      const searchStart = Math.max(end - 200, start);
      const searchRange = content.substring(searchStart, end + 200);
      
      // Try different paragraph separators
      let paragraphBreak = searchRange.lastIndexOf('\n\n');
      if (paragraphBreak < 0) {
        paragraphBreak = searchRange.lastIndexOf('\n');
      }
      if (paragraphBreak < 0) {
        paragraphBreak = searchRange.lastIndexOf('。');
      }
      
      if (paragraphBreak >= 0) {
        const candidateBreak = searchStart + paragraphBreak + 1;
        // Ensure we make reasonable progress (at least 50% of SEGMENT_SIZE)
        const minProgress = Math.floor(this.SEGMENT_SIZE * 0.5);
        if (candidateBreak - start >= minProgress) {
          breakPoint = candidateBreak;
        }
      }
    }

    return content.substring(start, breakPoint);
  }
}

describe('Segmentation Logic', () => {
  const segmenter = new TestSegmenter();

  it('should handle content with many newlines correctly', () => {
    // 生成 6000+ 字符的内容，每行约 100 字符
    const lines: string[] = [];
    for (let i = 0; i < 70; i++) {
      lines.push('这是第' + i + '行内容，长度大约一百个字符左右，需要多写一些才能达到目标长度。'.repeat(3));
    }
    const content = lines.join('\n');
    
    console.log('Content length:', content.length);
    
    const segments = segmenter.segmentContent(content);
    
    console.log('Number of segments:', segments.length);
    segments.forEach((seg, i) => {
      console.log(`Segment ${i + 1}: ${seg.length} chars`);
    });
    
    // 6000 字符应该分成 2 段
    expect(segments.length).toBeLessThanOrEqual(3);
    expect(segments.length).toBeGreaterThanOrEqual(2);
  });

  it('should handle content with Chinese periods correctly', () => {
    // 生成 6000+ 字符的内容，每句约 50 字符
    const sentences: string[] = [];
    for (let i = 0; i < 130; i++) {
      sentences.push('这是第' + i + '句内容，长度大约五十个字符左右，需要多写一些才能达到目标长度。');
    }
    const content = sentences.join('');
    
    console.log('Content length:', content.length);
    
    const segments = segmenter.segmentContent(content);
    
    console.log('Number of segments:', segments.length);
    segments.forEach((seg, i) => {
      console.log(`Segment ${i + 1}: ${seg.length} chars`);
    });
    
    // 6000 字符应该分成 2 段
    expect(segments.length).toBeLessThanOrEqual(3);
    expect(segments.length).toBeGreaterThanOrEqual(2);
  });

  it('should handle short content without segmentation', () => {
    const content = '这是一段短内容，只有几百个字符。'.repeat(10);
    
    const segments = segmenter.segmentContent(content);
    
    console.log('Short content length:', content.length);
    console.log('Number of segments:', segments.length);
    
    // 短内容应该只有 1 段
    expect(segments.length).toBe(1);
  });

  it('should handle 10000 character content', () => {
    // 生成 10000+ 字符的内容
    const lines: string[] = [];
    for (let i = 0; i < 110; i++) {
      lines.push('这是第' + i + '行内容，长度大约一百个字符左右，需要多写一些才能达到目标长度。'.repeat(3));
    }
    const content = lines.join('\n');
    
    console.log('Content length:', content.length);
    
    const segments = segmenter.segmentContent(content);
    
    console.log('Number of segments:', segments.length);
    segments.forEach((seg, i) => {
      console.log(`Segment ${i + 1}: ${seg.length} chars`);
    });
    
    // 10000 字符应该分成 3 段左右
    expect(segments.length).toBeLessThanOrEqual(4);
    expect(segments.length).toBeGreaterThanOrEqual(2);
  });

  it('should not create infinite loop with problematic content', () => {
    // 生成一个可能触发无限循环的内容：很多短行
    const lines: string[] = [];
    for (let i = 0; i < 1000; i++) {
      lines.push('短' + i);
    }
    const content = lines.join('\n');
    
    console.log('Problematic content length:', content.length);
    
    // 不应该抛出无限循环错误
    expect(() => segmenter.segmentContent(content)).not.toThrow();
    
    const segments = segmenter.segmentContent(content);
    console.log('Number of segments:', segments.length);
    
    // 段数应该合理（不会太多）
    expect(segments.length).toBeLessThan(10);
  });
});
