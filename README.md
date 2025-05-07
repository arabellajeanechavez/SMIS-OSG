# Tech stack
- Next.js para sa backend, and javascript, html, css front-end apil tailwindcss, deployment kay docker,

## Steps in running locally:
wget https://repo.mongodb.org/apt/ubuntu/dists/noble/mongodb-org/8.0/multiverse/binary-amd64/mongodb-org-server_8.0.6_amd64.debrepo.mongodb.org

wget https://downloads.mongodb.com/compass/mongodb-mongosh_2.5.0_amd64.deb

Note: 
I use wsl so:
sudo dpkg -i <filename>
sudo systemctl status mongod

After installation:

mkdir databases
mkdir ~/databases/db0
mkdir ~/databases/db1

on seperate terminals run

pnpm run mongod0
pnpm run mongod1

sudo systemctl start mongod
mongosh

rs.initiate()
rs.add("localhost:27117")

pnpm install
pnpm run dev

rs.initiate({ _id: "rs0", members: [ { _id: 0, host: "localhost:27017" }, { _id: 1, host: "localhost:27117" } ] })

Go to your mongodbcompass then put this in the URI:
mongodb://127.0.0.1:27017,127.0.0.1:27117/smischolar/?replicaSet=rs0

