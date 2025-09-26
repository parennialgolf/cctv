FROM oven/bun:1
WORKDIR /app
COPY . /app
EXPOSE 3000
ENV NODE_ENV=production
CMD ["bun", "run", "server.ts"]