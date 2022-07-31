/*
 _____  _             _______ _      _        _       
|  __ \| |           |__   __(_)    | |      | |      
| |__) | | _____  __    | |   _  ___| | _____| |_ ___ 
|  ___/| |/ _ \ \/ /    | |  | |/ __| |/ / _ \ __/ __|
| |    | |  __/>  <     | |  | | (__|   <  __/ |_\__ \
|_|    |_|\___/_/\_\    |_|  |_|\___|_|\_\___|\__|___/
                                        
Thank you for purchasing Plex Tickets!
If you find any issues, need support, or have a suggestion for the bot, please join our support server and create a ticket,
https://discord.gg/eRaeJdTsPY
*/

const { Discord, MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu, Message, MessageAttachment } = require("discord.js");
const fs = require('fs');
const yaml = require("js-yaml")
const config = yaml.load(fs.readFileSync('./config.yml', 'utf8'))
const commands = yaml.load(fs.readFileSync('./commands.yml', 'utf8'))

exports.run = async (client, message, args) => {
    if(config.SuggestionSettings.Enabled === false) return;
    message.delete()

    let suggestc = client.channels.cache.get(config.SuggestionSettings.ChannelID)
    if(!suggestc) return message.channel.send({ content: `Suggestion channel has not been setup! Please fix this in the bot's config!` })
    let avatarurl = message.author.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 });

    let suggestion = args.join(" ")
    let invalidusage = new MessageEmbed()
    .setColor("RED")
    .setDescription('Too few arguments given\n\nUsage:\n``suggest <suggestion>``')
    if(!suggestion) return message.channel.send({ embeds: [invalidusage] })
    
    if(config.SuggestionUpvote.ButtonColor === "BLURPLE") config.SuggestionUpvote.ButtonColor = "PRIMARY"
    if(config.SuggestionUpvote.ButtonColor === "GRAY") config.SuggestionUpvote.ButtonColor = "SECONDARY"
    if(config.SuggestionUpvote.ButtonColor === "GREEN") config.SuggestionUpvote.ButtonColor = "SUCCESS"
    if(config.SuggestionUpvote.ButtonColor === "RED") config.SuggestionUpvote.ButtonColor = "DANGER"

    if(config.SuggestionDownvote.ButtonColor === "BLURPLE") config.SuggestionDownvote.ButtonColor = "PRIMARY"
    if(config.SuggestionDownvote.ButtonColor === "GRAY") config.SuggestionDownvote.ButtonColor = "SECONDARY"
    if(config.SuggestionDownvote.ButtonColor === "GREEN") config.SuggestionDownvote.ButtonColor = "SUCCESS"
    if(config.SuggestionDownvote.ButtonColor === "RED") config.SuggestionDownvote.ButtonColor = "DANGER"

    if(config.SuggestionResetvote.ButtonColor === "BLURPLE") config.SuggestionResetvote.ButtonColor = "PRIMARY"
    if(config.SuggestionResetvote.ButtonColor === "GRAY") config.SuggestionResetvote.ButtonColor = "SECONDARY"
    if(config.SuggestionResetvote.ButtonColor === "GREEN") config.SuggestionResetvote.ButtonColor = "SUCCESS"
    if(config.SuggestionResetvote.ButtonColor === "RED") config.SuggestionResetvote.ButtonColor = "DANGER"

    if(config.SuggestionAccept.ButtonColor === "BLURPLE") config.SuggestionAccept.ButtonColor = "PRIMARY"
    if(config.SuggestionAccept.ButtonColor === "GRAY") config.SuggestionAccept.ButtonColor = "SECONDARY"
    if(config.SuggestionAccept.ButtonColor === "GREEN") config.SuggestionAccept.ButtonColor = "SUCCESS"
    if(config.SuggestionAccept.ButtonColor === "RED") config.SuggestionAccept.ButtonColor = "DANGER"

    if(config.SuggestionDeny.ButtonColor === "BLURPLE") config.SuggestionDeny.ButtonColor = "PRIMARY"
    if(config.SuggestionDeny.ButtonColor === "GRAY") config.SuggestionDeny.ButtonColor = "SECONDARY"
    if(config.SuggestionDeny.ButtonColor === "GREEN") config.SuggestionDeny.ButtonColor = "SUCCESS"
    if(config.SuggestionDeny.ButtonColor === "RED") config.SuggestionDeny.ButtonColor = "DANGER"

    const upvoteButton = new MessageButton()
    .setCustomId('upvote')
    .setLabel(config.SuggestionUpvote.ButtonName)
    .setStyle(config.SuggestionUpvote.ButtonColor)
    .setEmoji(config.SuggestionUpvote.ButtonEmoji)

    const downvoteButton = new MessageButton()
    .setCustomId('downvote')
    .setLabel(config.SuggestionDownvote.ButtonName)
    .setStyle(config.SuggestionDownvote.ButtonColor)
    .setEmoji(config.SuggestionDownvote.ButtonEmoji)

  
    const resetvoteButton = new MessageButton()
    .setCustomId('resetvote')
    .setLabel(config.SuggestionResetvote.ButtonName)
    .setStyle(config.SuggestionResetvote.ButtonColor)
    .setEmoji(config.SuggestionResetvote.ButtonEmoji)

    const acceptButton = new MessageButton()
    .setCustomId('accept')
    .setLabel(config.SuggestionAccept.ButtonName)
    .setStyle(config.SuggestionAccept.ButtonColor)
    .setEmoji(config.SuggestionAccept.ButtonEmoji)

    const denyButton = new MessageButton()
    .setCustomId('deny')
    .setLabel(config.SuggestionDeny.ButtonName)
    .setStyle(config.SuggestionDeny.ButtonColor)
    .setEmoji(config.SuggestionDeny.ButtonEmoji)

    
    let row = ""
    if(config.SuggestionSettings.EnableAcceptDenySystem) row = new MessageActionRow().addComponents(upvoteButton, downvoteButton, resetvoteButton, acceptButton, denyButton);
    if(config.SuggestionSettings.EnableAcceptDenySystem === false) row = new MessageActionRow().addComponents(upvoteButton, downvoteButton, resetvoteButton);

    let embed = new MessageEmbed()
    embed.setColor(config.SuggestionStatusesEmbedColors.Pending)
    embed.setAuthor({ name: `${config.Locale.newSuggestionTitle} (#${client.globalStats.get(`${message.guild.id}`, "totalSuggestions")})` })
    embed.addField(`• ${config.Locale.suggestionTitle}`, `> \`\`\`${suggestion}\`\`\``)
    if(config.SuggestionSettings.EnableAcceptDenySystem) embed.addField(`• ${config.Locale.suggestionInformation}`, `> **${config.Locale.suggestionFrom}** ${message.author}\n> **${config.Locale.suggestionUpvotes}** 0\n> **${config.Locale.suggestionDownvotes}** 0\n> **${config.Locale.suggestionStatus}** ${config.SuggestionStatuses.Pending}`)
    if(config.SuggestionSettings.EnableAcceptDenySystem === false) embed.addField(`• ${config.Locale.suggestionInformation}`, `> **${config.Locale.suggestionFrom}** ${message.author}\n> **${config.Locale.suggestionUpvotes}** 0\n> **${config.Locale.suggestionDownvotes}** 0`)
    embed.setThumbnail(avatarurl)
    embed.setFooter({ text: `${message.author.tag}`, iconURL: `${message.author.displayAvatarURL({ dynamic: true })}` })
    embed.setTimestamp()

    if (suggestc) suggestc.send({ embeds: [embed], components: [row] }).then(async function(msg) {

    await client.suggestions.ensure(`${msg.id}`, {
      userID: message.author.id,
      msgID: msg.id,
      suggestion: suggestion,
      upVotes: 0,
      downVotes: 0,
      status: "Pending"
    });

    client.globalStats.inc(message.guild.id, "totalSuggestions");

  })

    message.channel.send(config.Locale.suggestionSubmit).then(msg => setTimeout(() => msg.delete(), 4000));

}


module.exports.help = {
  name: 'suggest',
  enabled: commands.General.Suggest.Enabled
}
