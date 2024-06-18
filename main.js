const { Storage } = require('@google-cloud/storage');
const speech = require('@google-cloud/speech');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { createObjectCsvWriter } = require('csv-writer');

// Google Cloud credentials and setup
const gcsBucketName = 'sample-voice-bucket';
const storage = new Storage();
const speechClient = new speech.SpeechClient();

// Azure OpenAI credentials
const azureApiKey = 'b3e819600fbe4981be34ef2aa79943e2';
const azureEndpoint = 'https://ik-oai-eastus-2.openai.azure.com/';
const azureDeploymentName = 'gpt-4o';

// Folder containing the files to be processed
const folderPath = './audioFiles';

process.env.GOOGLE_APPLICATION_CREDENTIALS = "key.json";



// CSV Writer setup
const csvWriter = createObjectCsvWriter({
    path: 'log.csv',
    header: [
        { id: 'fileName', title: 'File Name' },
        { id: 'transcription', title: 'Transcription' },
        { id: 'summary', title: 'Summary' },
        { id: 'executionTime', title: 'Execution Time (ms)' }
    ]
});

// Upload file to Google Cloud Storage
const uploadFileToGCS = async (localFilePath) => {
    const gcsFilePath = path.basename(localFilePath);
    await storage.bucket(gcsBucketName).upload(localFilePath, {
        destination: gcsFilePath,
    });

    console.log(`${localFilePath} uploaded to ${gcsBucketName}/${gcsFilePath}`);
    return gcsFilePath;
};

// Transcribe the file using Google Cloud Speech-to-Text
const transcribeFile = async (gcsFilePath) => {
    const gcsUri = `gs://${gcsBucketName}/${gcsFilePath}`;

    const request = {
        audio: {
            uri: gcsUri,
        },
        config: {
            encoding: 'LINEAR16', // Adjust based on your file's encoding
            //sampleRateHertz: 16000, // Adjust based on your file's sample rate
            languageCode: 'th-TH', // Adjust based on your file's language
        },
    };

    const [response] = await speechClient.longRunningRecognize(request);
    const [operationResult] = await response.promise();
    const transcription = operationResult.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');

    console.log('Transcription:', transcription);
    return transcription;
};

// Get summary using Azure OpenAI ChatGPT
const getSummary = async (transcription) => {
    const url = `${azureEndpoint}/openai/deployments/${azureDeploymentName}/chat/completions?api-version=2023-09-01-preview`;
    const prompt = require("./prompts.js");
    const data = {
        messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: `transcription: ${transcription}` }
        ]
    };

    const headers = {
        'Content-Type': 'application/json',
        'api-key': azureApiKey
    };

    try {
        const response = await axios.post(url, data, { headers });
        const completions = response.data.choices;
        if (completions && completions.length > 0) {
            console.log('Summary:', completions[0].message.content);
            return completions[0].message.content;
        } else {
            console.log('No summary found');
            return '';
        }
    } catch (error) {
        console.error('Error calling Azure OpenAI API:', error.response ? error.response.data : error.message);
        return '';
    }
};

const processFile = async (filePath) => {
    const startTime = Date.now();

    try {
        const gcsFilePath = await uploadFileToGCS(filePath);
        const transcription = await transcribeFile(gcsFilePath);
        const summary = await getSummary(transcription);

        const executionTime = Date.now() - startTime;

        return {
            fileName: path.basename(filePath),
            transcription,
            summary,
            executionTime
        };
    } catch (error) {
        console.error('Error processing file:', filePath, error);
        return {
            fileName: path.basename(filePath),
            transcription: '',
            summary: '',
            executionTime: Date.now() - startTime
        };
    }
};

const main = async () => {
    try {
        const files = fs.readdirSync(folderPath)
            .filter(file => path.extname(file).toLowerCase() === '.wav');

        const records = [];
        for (const file of files) {
            const filePath = path.join(folderPath, file);
            const record = await processFile(filePath);
            records.push(record);
        }

        await csvWriter.writeRecords(records);
        console.log('Logs have been written to log.csv');
    } catch (error) {
        console.error('Error reading folder:', error);
    }
};

main();
