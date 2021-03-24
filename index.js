require("dotenv").config();

//! BOT Connections
const Discord = require("discord.js");
const Keyv = require("keyv");
const { BOT_TOKEN } = process.env;
const db = require("./db");

const bot = new Discord.Client();
bot.on("ready", readyDiscord);
function readyDiscord() {
  console.log("bot token 200OK");
}
const keyv = new Keyv("sqlite://test-db.sqlite");
// const keyv = new Keyv("sqlite://test-db.sqlite", { namespace: 'users'});
keyv.on("error", (err) => console.log("Connection Error", err));

// ? DRY Functions
const statEmbed = async (username, rank) => {
  let embed = new Discord.MessageEmbed();
  embed.setTitle(`Ranking for ${username}`);
  embed.setDescription(`Current exp : ${rank}`);
  embed.setImage(
    "https://i.pinimg.com/originals/12/92/d1/1292d12c0e2ca423915fc45694a3d9bb.png"
  );
  return embed;
};

const privatePromo = async (username, rank) => {}

// ?--- END ---
const prefix = "?";
bot.on("message", async (msg) => {
  console.log("hit, bot.on");
  if (msg.content[0] !== prefix) {
    console.log("no prefix");
    return;
  }
  const args = msg.content.slice(prefix.length).trim().split(" ");
  const command = args.shift().toLowerCase();

  // if (msg.content === "?info") {
  //   msg.reply(
  //     `Playing any First-person shooter game is not a cakewalk.`
  //   );
  // }

  // ! STATS Statment
  if (command === "stats") {
    const user = msg.author;
    let rank = await keyv.get(user.username);

    if (rank === undefined) {
      await keyv.set(user.username, 1);
      rank = await keyv.get(user.username);
    }
    let embed = await statEmbed(user.username, rank);
    msg.channel.send(embed);
  }

  // ! PROMOTE Statment
  if (command === "promote") {
    console.log("hit, promote statment");
    if (!msg.member.roles.cache.has("821806067532955669")) {
      console.log("user is not a moderator Private");
      return;
    }

    const user = msg.mentions.users.first();
    if (!user) {
      console.log("no user mentioned");
      return;
    }

    let rankVal = await keyv.get(user.username);
    if (rankVal === undefined) {
      console.log(rankVal);
      await keyv.set(user.username, 1);
      rankVal = await keyv.get(user.username);
    }

    let num = 1;
    if (args.length > 1) {
      num = parseInt(args[0]);
    }
    const newRank = rankVal + num;
    await keyv.set(user.username, newRank);

    const checker = await keyv.get(user.username);

    if (checker >= 10) {
      let modeRole = msg.guild.roles.cache.find(
        (r) => r.name === "Private First Class 🏅"
      );
      let member = msg.mentions.members.first();
      member.roles.add(modeRole);
    }
    //? 12:12 min https://www.youtube.com/watch?v=W_belnWXFhE
  }

  //! DEMOTE Statment

  if (command === "demote") {
    console.log("hit, demote statment");
    if (!msg.member.roles.cache.has("821806067532955669")) {
      console.log("user is not a moderator Private");
      return;
    }

    const user = msg.mentions.users.first();
    if (!user) {
      console.log("no user mentioned");
      return;
    }

    let rankVal = await keyv.get(user.username);
    if (rankVal === undefined) {
      console.log(rankVal);
      await keyv.set(user.username, 1);
      rankVal = await keyv.get(user.username);
    }

    let num = 1;
    if (args.length > 1) {
      num = parseInt(args[0]);
    }
    const newRank = rankVal - num;
    await keyv.set(user.username, newRank);

    const checker = await keyv.get(user.username);

    if (checker < 10) {
      let modeRole = msg.guild.roles.cache.find((r) => r.name === "General");
      let member = msg.mentions.members.first();
      member.roles.remove(modeRole);
    }
  }

  if (command === "highscore") {
    let rows = await db.select();
    console.log(rows)
    // ? 17:55
    // ? https://www.youtube.com/watch?v=W_belnWXFhE

    let sortedData = [];

    sortedData = rows.sort((a, b) => {
      let newA = JSON.parse(a.value);
      let newB = JSON.parse(b.value);
      a.value = newA;
      b.value = newB;

      let val = b['value']["value"] - a["value"]["value"] 
      return val
    });

    console.log(sortedData)

    if (sortedData.length > 5){
      sortedData = sortedData.slice(0,5)
    }

    let embed = new Discord.MessageEmbed()
    embed.setTitle("Highest Ranked Member")
    embed.setDescription(`Top ${sortedData.length} users`)

    sortedData.map(user => {
      let username = user["key"].slice(5)
      let score = user["value"]["value"]
      embed.addField(`${username} : `, score)
    })
    embed.setFooter(`this embed made by ${bot.user.username}`)

    msg.channel.send(embed)
  }
});

bot.login(BOT_TOKEN);
