## How to run the code

### Install some dev tools (you need to do this only once !)
You need to install `pip`, `python`, `git`, `npm`, `bower`. 
1. For ubuntu:
> sudo apt-get install python-pip python-dev npm

> sudo npm install -g bower

Fix for ubuntu (see http://stackoverflow.com/questions/21491996/installing-bower-on-ubuntu )
> sudo ln -s /usr/bin/nodejs /usr/bin/node 

2. For Mac
Install `brew`if you haven't done it already : http://brew.sh
Then install `pip` which is in Python Brew package
> sudo brew install python

Then `node`
> sudo brew install node

Finally `bower`:
> sudo npm install -g bower


### Install Python and JS libraries that the projects uses.
You need to retype these commands in case new libraries are added in requirements.txt and bower.json.

Install all the necessary Python libraries:
> pip install -r requirements.txt

Install all the JS libraries:
> cd static/; bower install

### Run the server and use the website !
Run the server:
> python server.py

Then go to [localhost](http://localhost:5000) to use the website !
 
To run unit test, please launch the server locally and then run all the unit tests by 
> nosetests
