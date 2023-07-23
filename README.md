# DL2

Deep Learning Learning Platform

## Frontend

Uses Angular & Angular material to host a frontend. Angular material provides an
out-of-the-box development experience considering UI design.

### Features

- Graph visualisation: Uses D3, a rather complex graph engine with embedded physics engine that handles the forces among nodes.
- WebASM integrated LSP: Uses Jedi, Python language metatools to provide code autocompletions, embedded in JS using Pyodide.

## Backend

- Weaviate: Using Weaviate Vector Database API, we can retrieve the vector encoded by HuggingFace Model [all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2), and find the objects closest to the query concepts.
- Neo4j: Neo4j is a graph database based on Cypher, which helps us find the neighbors of a paper on the citation graph with great convenience and performance.

## TODOs

- Autoscaler deployment of backend
- WSGI service of RFS
- Cache the python file in the frontend with IndexedDB
- New Paper Recommendation System
- DataComp: Data Competition Platform(Beta)
