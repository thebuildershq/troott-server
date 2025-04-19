/**
 * Generates random characters
 * @param length - The length of the characters to generate.
 * @returns A randomly generated characters.
 */
export const generateRandomChars = (length: number = 20) => {
  const numberChars = "0123456789";
  const letterChars = "abcdefghijklmnopqrstuvwxyz";
  const allChars = numberChars + letterChars;

  const shuffle = (str: string) =>
    str
      .split("")
      .sort(() => 0.5 - Math.random())
      .join("");

  const shuffledChars = shuffle(allChars);

  const randomChars = shuffledChars.slice(0, length);

  return randomChars;
};

/**
 * Generates random numbers
 * @param length - The length of the numbers to generate.
 * @returns A randomly generated numbers.
 */
export const generateRandomNumbers = (length: number = 20) => {
  const numberChars = "0123456789";
  const shuffledChars = numberChars
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");
  const randomNumbers = shuffledChars.slice(0, length);
  return randomNumbers;
};

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
    str
      .split("")
      .sort(() => 0.5 - Math.random() * 1000000)
      .join("");

  const shuffledChars = shuffle(allChars);

  const randomChars = shuffledChars.slice(0, length);

  return randomChars;
};

/**
 * Generates a secure random password.
 * Password will contain:
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 * - Minimum length of 8 characters (default is 12)
 *
 * @param length - Total length of the password (default: 12).
 * @returns A randomly generated secure password.
 */
export const generatePassword = (length: number = 16) => {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%^&*()_+~`|}{[]:;?><,./-=";
  
  const getRandomChar = (charset: string) => charset[Math.floor(Math.random() * charset.length)];
  
  // Ensure password meets all requirements
  let password = [
    getRandomChar(uppercase),
    getRandomChar(lowercase),
    getRandomChar(numbers),
    getRandomChar(special),
  ];


  const allChars = uppercase + lowercase + numbers + special;
  for (let i = password.length; i < length; i++) {
    password.push(getRandomChar(allChars));
  }

  // Shuffle the password to make it more random
  return password.sort(() => Math.random() - 0.5).join("");
};


/**
 * Generate a secure API key.
 * @param {number} expiryDays - Number of days before the key expires (null for no expiration).
 * @param {string[]} permissions - The access rights assigned to this key.
 * @returns {string} - The generated API key.
 */
export const generateApiKey = () => {};

/**
 * Helper method to determine platform type
 */
export const detectPlatform = (
  deviceType: string | undefined
): "web" | "mobile" | "tablet" => {
  if (!deviceType) return "web";
  if (deviceType.toLowerCase() === "tablet") return "tablet";
  if (["mobile", "phone"].includes(deviceType.toLowerCase())) return "mobile";
  return "web";
};

export default {
  generateRandomChars,
  generateRandomNumbers,
  generateRandomCode,
  generatePassword,
  generateApiKey,
  detectPlatform,
};
