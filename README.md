# Microservices-Blog-API
## Description

This is a Microservices REST-API that consists of two separate Microservices

1. POSTS service which used MySQL DBMS.
2. COMMENTS service which used a No-SQL Database which is MongoDB 

### The connection between the two services is achieved by two methods:

1. API calls for getting the post either need to add a comment to it or read its comments.
2. Using a Message Broker (RabbitMQ) to send a message to the queue, indicating that a post has been deleted, and having the comments service consume that message to delete all comments related to that post.
