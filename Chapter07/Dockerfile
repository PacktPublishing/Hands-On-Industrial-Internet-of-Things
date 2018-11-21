FROM    alpine
# Install python3
RUN apk add --update python3
# Copy html
RUN mkdir /src
ADD static/ /src
RUN cd /src
# Run http server on port 8080
EXPOSE  8080
CMD ["python3", "-m", "http.server", "8080"]