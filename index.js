const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();

const embeds = require("./embeds.js");
const { prefix } = require('./crayons.json');
client.commands = new Discord.Collection();
const newUsers = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
let embedPermissions = 1;

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);

	// set a new item in the Collection
	// with the key as the command name and the value as the exported module
	client.commands.set(command.name, command);
	console.log(`${file} loaded!`)
}

client.once('ready', () => {
	console.log('Ready!');
	client.user.setActivity('my Salad balance', { type: 'WATCHING' });
});

client.on('message', message => {

  if ((message.channel.type == "text" && !message.guild.me.hasPermission("EMBED_LINKS"))) embedPermissions = 0

  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) {
			reply = `Uh ${message.author}... that command (**${commandName}**) isn't a thing, sorry!`
			if (embedPermissions == 0) return message.channel.send(reply)
      message.channel.send(embeds.errorEmbed(reply))
      return;
  }

  if (command.guildOnly && message.channel.type !== 'text') {
	   return message.channel.send(embeds.errorEmbed(`Uh ${message.author}... I can't use that command inside a DM.`))
  }

  if (command.args && !args.length) {
    let reply = `Uh ${message.author}... that command requires some arguments, but you didn't provide me any.`;

    if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
 		}
		if (embedPermissions == 0) return message.channel.send(reply)
 		return message.channel.send(embeds.errorEmbed(reply))
 	}

	if (command.dcPermissions) {
		console.log("-------------PERMISSION CHECKS---------------")
		var breaker = 0;
		for (i = 0, len = command.dcPermissions.length; command.dcPermissions; i < len, i++) {
			if (command.dcPermissions[i] == undefined) {
				console.log(`That should be it for ${prefix}${commandName} - yay! Breaking the loop now...`)
				break;
			}
			if (breaker == 1) break;
			console.log(`${prefix}${commandName} wants ${command.dcPermissions[i]} - checking for permission...`)
		  if ((message.channel.type == "text" && !message.guild.me.hasPermission(command.dcPermissions[i]))) {
				console.log(`Crap, looks like someone forgot to give us ${command.dcPermissions[i]}. Breaking the loop now...`)
				breaker = 1
				console.log("---------------------------------------------")
				reply = `Sorry, but I need the \`${command.dcPermissions[i]}\` permission to use that command.`
				if (embedPermissions == 0) return message.channel.send(reply)
				message.channel.send(embeds.errorEmbed(reply))
				return;
			}
			console.log(`Looks like we have ${command.dcPermissions[i]}! Okay, moving on...`)
		}
		console.log("---------------------------------------------")
	}

  try {
  	command.execute(message, args);
  } catch (error) {
	console.log(`error while trying to execute command: ${error.message}`)
  	message.reply('there was an error trying to execute that command!');
    message.channel.send(embeds.errorEmbed(error.message))
  }
});

client.login(process.env.BOT_TOKEN);