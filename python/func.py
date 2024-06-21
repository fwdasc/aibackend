from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.prebuilt import create_react_agent
from langchain_community.tools import WikipediaQueryRun
from langchain_community.utilities import WikipediaAPIWrapper

import os
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import AzureChatOpenAI


os.environ["AZURE_OPENAI_API_KEY"] = 'b3e819600fbe4981be34ef2aa79943e2'

from langchain_core.tools import tool

class Func:

    @tool
    def sendEmail(receiver_email: str, message: str):
        """
        use this to send mail to receiver_email with the body of message
        """
        import smtplib, ssl

        port = 587  # For starttls
        smtp_server = "smtp.gmail.com"
        sender_email = "asachoitw@gmail.com"
        password = "pzzh inaj zzle rpcx"
    

        context = ssl.create_default_context()
        with smtplib.SMTP(smtp_server, port) as server:
            server.ehlo()  # Can be omitted
            server.starttls(context=context)
            server.ehlo()  # Can be omitted
            server.login(sender_email, password)
            server.sendmail(sender_email, receiver_email, message, )


    @tool
    def getingPolicyInfo(customerId: str):
        """
        "use this tool when you need to get Policy Information, and you must provide the customer ID"
        """
    
        return f"policy found for {customerId} product: set for life, premium: 20000"

    @tool
    def getCustomerID(name: str, phone: str):
        """get the customerID base on customer name and phone number, both phone and name are mandatory"""
        return "12345"

    @tool
    def getUserInfo(username: str):
        """get user information base on username"""
        print("searching user:" + username)
        import requests
        r = requests.get("https://dummyjson.com/users/")
        users = r.json()["users"]

        user = [u for u in users if u["firstName"] == username]
        return user
