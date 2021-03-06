const embeds = require("../embeds.js");
const fetch = require("node-fetch");

module.exports = {
	name: "wikipedia",
	description: "Search Wikipedia using VukkyBot!",
	botPermissions: ["EMBED_LINKS"],
	execute(message, args) {
		message.channel.send("<a:offlinegif:757979855924101220> Hold on! I'm getting the data...")
			.then(newMessage => {
				var search = args.slice(0).join(" ");
				fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${search}`)
					.then(res => res.json())
					.then(json => {
						if(json.type === "https://mediawiki.org/wiki/HyperSwitch/errors/not_found") {
							newMessage.edit(`\`${search}\` doesn't exist.`);
						} else if (json.type === "https://mediawiki.org/wiki/HyperSwitch/errors/bad_request" && json.detail === "title-invalid-characters") {
							newMessage.edit(`\`${search}\` contains invalid characters.`);
						} else {
							newMessage.edit(`**${json.titles.normalized}** - *${json.description || "no short description available"}*\n${json.extract}`);
						}
					});
			});
	},
};
