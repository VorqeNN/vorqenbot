const { Discord, MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu } = require("discord.js");
const fs = require('fs');
const yaml = require("js-yaml")
const config = yaml.load(fs.readFileSync('./config.yml', 'utf8'))

module.exports = async (client, interaction) => {
  
    // Add 1 to globalStats.totalTickets when a new ticket gets created
    client.globalStats.inc(interaction.guild.id, "totalTickets");
    //

    // Reset select menu selection
    if(config.TicketSettings.SelectMenu) await interaction.channel.messages.fetch(client.ticketPanel.get(config.GuildID, 'msgID')).then(async msg => {

        let sMenu = new MessageSelectMenu()
        .setCustomId("categorySelect")
        .setPlaceholder(config.Locale.selectCategory)
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(client.ticketPanel.get(config.GuildID, 'selectMenuOptions'));
        let sRow = new MessageActionRow().addComponents(sMenu);
        await msg.edit({ components: [sRow] })
    })
    //

    // Sync globalStats.openTickets
        let openNow = 0
        let openInDb = client.globalStats.get(`${interaction.guild.id}`, "openTickets")
        await interaction.guild.channels.cache.forEach(c => {
            if(client.tickets.has(c.id)) {
                openNow = openNow + 1
        }
    })
    if(openInDb !== openNow) {
        client.globalStats.set(interaction.guild.id, openNow, "openTickets");
    }
    //

};





// 9072c61d2067f8b39c00ac8646427e42
// f7b04dad18cbf24d545fd117b8a0a074