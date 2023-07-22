FROM public.ecr.aws/lambda/nodejs:latest as builder
WORKDIR /usr/app
# COPY package.json  ./
# COPY ./src/BaseCrawler.ts ./src/
# COPY ./src/CRCrawler.ts ./src/
# COPY ./src/index.ts ./src/
# COPY ./src/InverseCrawler.ts ./src/
# COPY ./src/MethodCrawler.ts ./src/
# COPY ./src/PaperCrawler.ts ./src/
# COPY ./src/TaskCrawler.ts ./src/
# COPY ./src/SubscriptionCrawler.ts ./src/
# COPY ./types/* ./types/
# COPY ./utils/* ./utils/
# RUN npm init -y
# RUN npm install axios chalk fast-xml-parser
# RUN npm install -D @types/aws-lambda esbuild
# RUN npm run build
COPY ./dist/* ./dist/
    

FROM public.ecr.aws/lambda/nodejs:latest
WORKDIR ${LAMBDA_TASK_ROOT}
COPY --from=builder /usr/app/dist/* ./
CMD ["index.handler"]