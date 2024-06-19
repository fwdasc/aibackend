import bs4
from langchain import hub
#from langchain_community.document_loaders import WebBaseLoader
 
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.prebuilt import create_react_agent

import os
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import AzureChatOpenAI
#from langchain_mistralai import ChatMistralAI

os.environ["AZURE_OPENAI_API_KEY"] = 'b3e819600fbe4981be34ef2aa79943e2'
#os.environ["MISTRAL_API_KEY"] = 'QLrfXO2hbUYXoUtSqDXm0bGiwcOiSQmd'




def getingPolicyInfo(customername):
    """Retrive policy information

    Args:
        customername: customer name
    Returns:
    """
    print("connect to policy system to get the data " + customername)
    return "name: " + customername

"""
llm = ChatMistralAI(model="mistral-large-latest")
prompt = ChatPromptTemplate.from_messages(
[
    SystemMessage(content="Translate the following from English into Italian"),
    HumanMessage(content="hi!"),
]
)
"""

llm = AzureChatOpenAI(
    azure_endpoint="https://ik-oai-eastus-2.openai.azure.com/",
    azure_deployment="gpt-4o",
    openai_api_version="2023-09-01-preview",
)
#parser = StrOutputParser()

#tools = load_tools(["llm-math", "wolfram-alpha", "wikipedia"], llm=llm)
#memory = ConversationBufferMemory(memory_key="chat_history")


#chain = prompt | llm | parser
#result = chain.invoke({})
 


agent_executor = create_react_agent(llm, [getingPolicyInfo])

for chunk in agent_executor.stream({"messages": [HumanMessage(content="What is the policy info for Asa Choi?")]}):
    if(chunk.get("agent")):
        print(chunk["agent"]["messages"])
        print("-----")