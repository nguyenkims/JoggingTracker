FROM python:3.5.2

# install node
RUN apt-get update
RUN apt-get install -y curl python-software-properties
RUN curl -sL https://deb.nodesource.com/setup_6.x | bash -
RUN  apt-get install nodejs
RUN npm install -g bower


ADD . /code
WORKDIR /code


# install dependencies via bower
RUN cd static && ls && bower install --allow-root

# install python dependencies
RUN pip3 install -q -r requirements.txt

# expose port
EXPOSE 5001

CMD python3 jt.py
