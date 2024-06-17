// Imports the Google Cloud client library
const speech = require('@google-cloud/speech');
const fs = require('fs');
const client = new speech.SpeechClient(

);
/**
 * TODO(developer): Uncomment the following lines before running the sample.
 */
// The ID of your GCS bucket
const bucketName = 'sample-voice-bucket';

// The path to your file to upload
const filePath = './C29141837_วิชยุตม์ แหนเศษ_02.wav';

// The new ID for your GCS file
const destFileName = 'sample.wav';

// Imports the Google Cloud client library
const { Storage } = require('@google-cloud/storage');
const { time } = require('console');
const { isDate } = require('util/types');

process.env.GOOGLE_APPLICATION_CREDENTIALS = "key.json";

/**
 * Calls the Speech-to-Text API on a demo audio file.
 */
async function transcript() {
    const gcsUri = `gs://${bucketName}/${destFileName}`;

    // The audio file's encoding, sample rate in hertz, and BCP-47 language code
    const audio = {
        uri: gcsUri,
    };



    const config = {
        encoding: 'LINEAR16',
        languageCode: 'th-TH',
    };
    const request = {
        audio: audio,
        config: config,
    };

    // Detects speech in the audio file. This creates a recognition job that you
    // can wait for now, or get its result later.
    const [operation] = await client.longRunningRecognize(request);
    // Get a Promise representation of the final result of the job
    const [response] = await operation.promise();
    const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join(' ');
    console.log({ transcription })

}



// Creates a client
const storage = new Storage(

);
async function uploadFile() {
    const options = {
        destination: destFileName,
        // Optional:
        // Set a generation-match precondition to avoid potential race conditions
        // and data corruptions. The request to upload is aborted if the object's
        // generation number does not match your precondition. For a destination
        // object that does not yet exist, set the ifGenerationMatch precondition to 0
        // If the destination object already exists in your bucket, set instead a
        // generation-match precondition using its generation number.
        //preconditionOpts: {ifGenerationMatch: generationMatchPrecondition},
    };


    await storage.bucket(bucketName).upload(filePath, options);
    console.log(`${filePath} uploaded to ${bucketName}`);
}

async function listBuckets() {
    const [buckets] = await storage.getBuckets();

    console.log('Buckets:');
    buckets.forEach(bucket => {
        console.log(bucket.name);
    });
}

//listBuckets().catch(console.error);
async function start() {
    const startTime = Date.now();
    await uploadFile();
    const UploadTime = Date.now() - startTime
    console.log("upload time:", UploadTime / 1000)
    await transcript();
    console.log("transcription time:", (Date.now() - startTime - UploadTime) / 1000)
}

start();