Clone it =>
git clone https://github.com/Svz1404/PushDC-NTE.git

cd PushDC-NTE

npm install node-fetch readline-sync fs chalk cfonts

Fill your token list on here :
nano token.txt

then run it
node index.js




<img width="1566" height="792" alt="image" src="https://github.com/user-attachments/assets/d18fb477-cb63-4255-bce1-4f30aca0bbf1" />


# ১. প্রজেক্ট ফোল্ডারে যান
cd ~/PushDC-NTE

# ২. package.json তৈরি করুন (যদি না থাকে)
echo '{
  "name": "pushdc-nte",
  "version": "1.0.0",
  "description": "Discord Auto Message Bot",
  "main": "sadi.js",
  "type": "module",
  "dependencies": {
    "chalk": "^4.1.2",
    "cfonts": "^3.2.0",
    "node-fetch": "^3.3.2",
    "readline-sync": "^1.4.10"
  },
  "scripts": {
    "start": "node sadi.js"
  }
}' > package.json

# ৩. dependencies ইনস্টল করুন
npm install

# ৪. token.txt ফাইল তৈরি করুন
echo "YOUR_DISCORD_BOT_TOKEN_HERE" > token.txt

# ৫. স্ক্রিপ্ট রান করুন
node sadi.js
