## How to run the code
You need to install `pip`, `python`, `git`, `npm`, `bower`
> sudo apt-get install python-pip python-dev npm
> sudo npm install -g bower

Fix for ubuntu (see http://stackoverflow.com/questions/21491996/installing-bower-on-ubuntu )
> sudo ln -s /usr/bin/nodejs /usr/bin/node 

Install all the necessary Python libraries:
> pip install -r requirements.txt

Install all the JS libraries:
> cd static/; bower install

Run the server:
> python server.py

Then go to [localhost](http://localhost:5000) to use the website !
 
To run unit test, please launch the server locally and then run all the unit tests by 
> nosetests
