# Media Cloud Microservices Architecture (MCMA)

This repository contains various libraries that assist in setting up media workflows in a multi-cloud environment. Example use cases of these libraries can be found in the [mcma-projects GitHub project](https://github.com/ebu/mcma-projects)

These libraries can be subdivided in two main categories
* **core libraries**  
One library per programming platform (e.g. Node.js, .NET, Java). The core library contains the model (e.g. classes, types, message contents) and helper functions and utilities to create and communicate properly formed messages. E.g. the [mcma-core-nodejs](mcma-core-nodejs) library is an implementation for the Node.js platform.
* **cloud provider specific libraries**  
These are implementations that abstract the particularities of a specific cloud providers (e.g. Amazon Web Services, Microsoft Azure, Google Cloud) to a predefined REST interface. E.g. the [mcma-aws-nodejs](mcma-aws-nodejs) library can be used in an AWS lambda function that is exposed through API Gateway and takes care of the handling of the REST interface and storing the items in a DynamoDB table.

## Objective

The goal of these libraries is to facilitate the discovery of and communication between media services from various vendors that can be deployed accross different cloud providers.

This is achieved by having
* REST API's with JSON-LD payload
* a service acting as a service registry allowing discovery of services and their REST endpoints
* predefined simple but extensible message payload focused on managing media workflows

## Message specifications

Operations on media files and/or streams are usually long running tasks. Therefore it became convenient to model such an operation as a 'Job'. A job basically describes what operation (i.e. JobProfile) needs to be performed (e.g. ExtractThumbnail or CreateProxy), what its input parameters are (e.g. path to a media file in an AWS bucket), and what the current status of the processing Job currently is. The status can be any of ```NEW```, ```RUNNING```, ```PAUSED```, ```COMPLETED```, ```FAILED```, or ```CANCELED```.

The type of work that needs to be done can vary drastically and therefore we have subclassed the Job into 6 different types: 
* ```CaptureJob```  
Representing a job that works on live media streams. Examples are recording a media stream into a file, or converting a media stream into a different format.

* ```TransferJob```  
Representing a job that does a file transfer. As services most likely will require the input files to be in the same region and cloud provider, the usage of TransferJobs will become essential. An example is copying a media file from an AWS bucket to an Azure Blob Storage.

* ```TransformJob```  
Representing a job that does a transformation on the media file. Examples are extracting thumbnails and creating lower resolution proxies.

* ```QAJob```  
Representing a job that does a quality analysis on a media file. Example is to check whether a file conforms to the AMWA AS-11 specification.

* ```AMEJob```  
Representing a job that does an automatic metadata extraction on a media file. Example is to extract technical metadata properties such is frame rate, video codec, bitrate etc

* ```AIJob```  
Representing a job that requires AI technologies to be used such as face, object, and scene detection, Speech-To-Text extraction and speech translation. These methods can be used on media files, but also on live streams.

Below you can find an example of a TransformJob. It is easy to identify the type, the jobProfile and the jobInput. 

Note that the jobProfile is represented as a URL. In our framework we allow and recommend (when it makes sense) the usage of URLs as a reference to where the actual resource (in this case the JobProfile) can be found. This helps in keeping the message payloads small and simple.

```JSON
{
  "@context": "http://mcma.ebu.ch/contexts/v1",
  "@type": "TransformJob",
  "jobProfile": "http://service-repository/job-profiles/441439e5-a409-4a60-b8fd-69cafeb301f9",
  "jobInput": {
    "@type": "JobParameterBag",
    "mcma:inputFile": {
      "@type": "mcma:Locator",
      "awsS3Bucket": "private-repo.mcma.ebu.ch",
      "awsS3Key": "media-file.mp4"
    },
    "mcma:outputLocation": {
      "@type": "mcma:Locator",
      "awsS3Bucket": "private-repo.mcma.ebu.ch",
      "awsS3KeyPrefix": "thumbnails/"
    }
  }
}
```

Below you can find an example an entry in the Service Registry describing a TransformService.
```JSON
{
  "@context": "http://mcma.ebu.ch/contexts/v1",
  "@type": "Service",
  "label": "FFmpeg TransformService",
  "hasResource": [
    {
      "@type": "ServiceResource",
      "resourceType": "mcma:JobAssignment",
      "httpEndpoint": "http://transform-service/job-assignments"
    }
  ],
  "acceptsJobType": "mcma:TransformJob",
  "acceptsJobProfile": [
    "http://service-repository/job-profiles/441439e5-a409-4a60-b8fd-69cafeb301f9",
    "http://service-repository/job-profiles/fd53075a-b91d-411c-8fa4-1f4d78e6810a"
  ],
  "inputLocation": [
    {
      "@type": "Locator",
      "awsS3Bucket": "private-repo.mcma.ebu.ch"
    }
  ],
  "outputLocation": [
    {
      "@type": "Locator",
      "awsS3Bucket": "private-repo.mcma.ebu.ch"
    }
  ]
}
```
