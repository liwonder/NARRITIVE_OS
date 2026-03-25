/**
 * Calculate word count for both English and Chinese text
 * - English: count words separated by whitespace
 * - Chinese: count characters (each character is a "word")
 */
export function calculateWordCount(content: string): number {
  if (!content || content.trim().length === 0) {
    return 0;
  }
  
  // Remove extra whitespace but keep content
  const cleaned = content.replace(/[\n\r\t]/g, ' ').trim();
  
  // Check if content is primarily Chinese (more than 30% Chinese characters)
  const chineseChars = cleaned.match(/[\u4e00-\u9fff]/g) || [];
  const totalChars = cleaned.length;
  const isChinese = chineseChars.length / totalChars > 0.3;
  
  if (isChinese) {
    // For Chinese, count characters (including Chinese punctuation)
    const meaningfulChars = cleaned.match(/[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/g) || [];
    return meaningfulChars.length;
  } else {
    // For English, count words separated by whitespace
    return cleaned.split(/\s+/).filter(w => w.length > 0).length;
  }
}
