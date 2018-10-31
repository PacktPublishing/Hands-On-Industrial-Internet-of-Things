# code of the book Hands-On Industrial Internet of Things, Veneri, Capasso, 2018
# based on https://github.com/awslabs/amazon-sagemaker-examples/blob/master/advanced_functionality/scikit_bring_your_own/scikit_bring_your_own.ipynb

FROM tensorflow/tensorflow:latest-py3

MAINTAINER IIOT-BOOK <giacomo.veneri@gmail.com>


RUN apt-get -y update && apt-get install -y --no-install-recommends \
         wget \
         python \
         nginx \
         ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Here we get all python packages.
# There's substantial overlap between scipy and numpy that we eliminate by
# linking them together. Likewise, pip leaves the install caches populated which uses
# a significant amount of space. These optimizations save a fair amount of space in the
# image, which reduces start up time.
# Install all of the packages
RUN pip install --upgrade pip
RUN pip install numpy
RUN pip install scipy
RUN pip install scikit-learn
RUN pip install pandas
RUN pip install flask
RUN pip install gevent
RUN pip install gunicorn
#RUN pip install tensorflow
#RUN pip install tensorflow-gpu
RUN pip install keras
RUN rm -rf /root/.cache
#RUN wget https://bootstrap.pypa.io/get-pip.py && python get-pip.py && \
#    pip install numpy==1.14.5 scipy scikit-learn pandas flask gevent gunicorn && \
#        (cd /usr/local/lib/python2.7/dist-packages/scipy/.libs; rm *; ln ../../numpy/.libs/* .) && \
#        rm -rf /root/.cache

# Set some environment variables. PYTHONUNBUFFERED keeps Python from buffering our standard
# output stream, which means that logs can be delivered to the user quickly. PYTHONDONTWRITEBYTECODE
# keeps Python from writing the .pyc files which are unnecessary in this case. We also update
# PATH so that the train and serve programs are found when the container is invoked.

ENV PYTHONUNBUFFERED=TRUE
ENV PYTHONDONTWRITEBYTECODE=TRUE
ENV PATH="/opt/program:${PATH}"

# Set up the program in the image
COPY rul /opt/program
WORKDIR /opt/program

