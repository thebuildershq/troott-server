
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

/**
 * Generates random numbers
 * @param length - The length of the numbers to generate.
 * @returns A randomly generated numbers.
 */
export const generateRandomNumbers = (length: number = 20) => {
    const numberChars = "0123456789";
    const shuffledChars = numberChars.split('').sort(() => 0.5 - Math.random()).join('');
    const randomNumbers = shuffledChars.slice(0, length);
    return randomNumbers;
}

/**
 * Generates random characters and numbers
 * @param length - The length of the characters and numbers to generate.
 * @returns A randomly generated characters and numbers.
 */
export const generateRandomCode = (length: number = 6) => {
    const numberChars = "0123456789";
    const letterChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const allChars = numberChars + letterChars;
    
    const shuffle = (str: string) => 
      str.split('').sort(() => 
      0.5 - Math.random()  * 1000000).join('');
  
    const shuffledChars = shuffle(allChars);
  
    const randomChars = shuffledChars.slice(0, length);
  
    return randomChars;
}


/**
 * Generates random characters, numbers and special characters
 * @param length - The length of the characters, numbers and special characters to generate.
 * @returns A randomly generated characters, numbers and special characters.
 */
export const generateRandomCharsAndNumbersAndSpecialChars = (length: number = 20) => {
    const numberChars = "0123456789";
    const letterChars = "abcdefghijklmnopqrstuvwxyz";
    const specialChars = "!@#$%^&*()_+~`|}{[]\:;?><,./-=";
    const allChars = numberChars + letterChars + specialChars;
    
    const shuffle = (str: string) => str.split('').sort(() => 0.5 - Math.random()).join('');
  
    const shuffledChars = shuffle(allChars);
  
    const randomChars = shuffledChars.slice(0, length);
  
    return randomChars;
}
 