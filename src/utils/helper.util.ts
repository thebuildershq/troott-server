
/**
 * Generates random characters
 * @param length - The length of the characters to generate.
 * @returns A randomly generated characters.
 */
export const generateRandomChars = (length: number = 20) => {
    const numberChars = "0123456789";
    const letterChars = "abcdefghijklmnopqrstuvwxyz";
    const allChars = numberChars + letterChars;
    
    const shuffle = (str: string) => str.split('').sort(() => 0.5 - Math.random()).join('');
  
    const shuffledChars = shuffle(allChars);
  
    const randomChars = shuffledChars.slice(0, length);
  
    return randomChars;
  }
 