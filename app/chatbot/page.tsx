"use client"
import { ChatGroq } from "@langchain/groq";
import { LLMChain } from "langchain/chains";
import { ChatOpenAI } from "@langchain/openai";
import { useState } from "react";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import axios from "axios";

export default function Chatbot() {
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);

  const model = new ChatGroq({
    temperature: 0,
    modelName: "mixtral-8x7b-32768",
    apiKey: process.env.NEXT_GROQ_API,
  });

  // const model = new ChatOpenAI({
  //   temperature: 0.4,
  //   modelName: "gpt-3.5-turbo-1106",
  //   openAIApiKey: 
  // });

  const promptTemplate = PromptTemplate.fromTemplate(
    `
    user's question: {question}
    Answer the above question in an practical informative way, to help farmers
    in a setp-by-step way help farmers to get started.

    This is the context from the data for the above question: 
    
     {support_mat}
     Use the above context to answer the user's question.
     Don't talk about the context that has been provided, only take the information from
    the above context and provide actionable steps to help farmers get started.

  If relevant information is not present in the above context, just say use your own
   general knowledge to answer the question.

    `
  );

  // 

  const strOutput = new StringOutputParser();

  const chain = new LLMChain({
    llm: model,
    prompt: promptTemplate,
    outputParser: strOutput,
  });

  const handleSubmit = async () => {
    setLoading(true);
    console.log("Sent Request");
    const user_prompt = document.createElement('p');
    user_prompt.className = "px-2 bg-blue-200 w-fit rounded-xl ml-auto"
    user_prompt.textContent = userInput;
    const chatbotResponseEl = document.getElementById("chat-bot-response");
    chatbotResponseEl!.appendChild(user_prompt);
    const response = await axios.post(`http://localhost:8000/ask/${"How to do farming!"}`,)
    const context = response.data.context;
    const chat_resposne = await chain.invoke({
      question: userInput,
      support_mat: context,
    });
    console.log(chat_resposne);
    const cres = document.createElement('p');
    cres.className = "bg-green-200 px-2 py-1 rounded-xl my-5"
    cres.textContent = chat_resposne.text;
    chatbotResponseEl!.appendChild(cres);
    setLoading(false);
  }

  return (
    // <button onClick={handleSubmit}>Submit</button>
    <div className="w-full h-screen">
      <h1 className="text-6xl text-center font-bold mt-10">FarmerSathi</h1>
      <div className="mx-auto mt-10 w-1/2 items-center h-screen">
        <div id="chat-bot-response" className="overflow-auto text-sm">
        </div>
        <div className="w-full">
          {
            loading ? <p className="text-center bg-gray-300 py-1 rounded-xl w-fit mx-auto px-2 text-sm my-10">FarmerSathi Thinking...</p> : ""
          }
          <div className="flex justify-center gap-5">
            <input className="border-2 border-gray-400 bottom-0 rounded-xl p-2" placeholder="Ask FarmerSathi..." type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} />
            <button onClick={handleSubmit} className="bg-green-500 text-white font-bold p-2 rounded-xl">Send</button>
          </div>
        </div>
      </div>
    </div>
  )
}