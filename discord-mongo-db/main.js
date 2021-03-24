//! BOT Connections
const Discord = require("discord.js");
require("dotenv").config();
const client = new Discord.Client({
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
});
// const { BOT_TOKEN } = process.env;
const mongoose = require("mongoose")

client.commands = new Discord.Collection();
client.enents = new Discord.Collection();
// const cooldowns = new Discord.Collection();
// ! https://www.youtube.com/watch?v=8no3SktqagY @MIN 7:00
["command_handler", "event_handler"].forEach((handler) => {
  require(`./handlers/${handler}`)(client, Discord);
})

mongoose.connect(process.env.MONGODB_SRV, {
  useNewUrlParser : true,
  useUnifiedTopology : true,
  useFindAndModify : false
}).then(() => {
  console.log("Connected to the database!")
}).catch((err) => {
  console.log(err)
})

client.login(process.env.DISCORD_TOKEN)

