FROM node:16-alpine as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY frontend ./
RUN yarn install 
RUN yarn add rsuite
RUN yarn add @datepicker-react/hooks
RUN yarn build

FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]