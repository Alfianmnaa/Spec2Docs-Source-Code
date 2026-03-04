const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Menggunakan model Flash untuk kecepatan dan efisiensi biaya
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

module.exports = model;
