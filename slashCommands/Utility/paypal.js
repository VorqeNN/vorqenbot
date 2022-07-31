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

const { SlashCommandBuilder } = require('@discordjs/builders');
const { Discord, MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu } = require("discord.js");
const fs = require('fs');
const yaml = require("js-yaml")
const config = yaml.load(fs.readFileSync('./config.yml', 'utf8'))
const commands = yaml.load(fs.readFileSync('./commands.yml', 'utf8'))

module.exports = {
    enabled: commands.Utility.Paypal.Enabled,
    data: new SlashCommandBuilder()
        .setName('paypal')
        .setDescription(commands.Utility.Paypal.Description)
        .addUserOption((option) => option.setName('user').setDescription('User').setRequired(true))
        .addIntegerOption((option) => option.setName('price').setDescription('Price').setRequired(true))
        .addStringOption(option => option.setName('service').setDescription('Service').setRequired(true)),
    async execute(interaction, client) {

        if(config.PayPalSettings.Enabled === false) return interaction.reply({ content: "This command has been disabled in the config!", ephemeral: true })
        if(config.PayPalSettings.OnlyInTicketChannels && !client.tickets.has(interaction.channel.id)) return interaction.reply({ content: config.Locale.NotInTicketChannel, ephemeral: true })

        let doesUserHaveRole = false
        for(let i = 0; i < config.PayPalSettings.AllowedRoles.length; i++) {
            role = interaction.guild.roles.cache.get(config.PayPalSettings.AllowedRoles[i]);
            if(role && interaction.member.roles.cache.has(config.PayPalSettings.AllowedRoles[i])) doesUserHaveRole = true;
          }

        if(doesUserHaveRole === false) return interaction.reply({ content: config.Locale.NoPermsMessage, ephemeral: true })
    
        let user = interaction.options.getUser("user");
        let price = interaction.options.getInteger("price");
        let service = interaction.options.getString("service");
        let serviceEncoded = encodeURIComponent(service.trim());
        let url = `https://www.paypal.com/cgi-bin/webscr?&cmd=_xclick&business=${config.PayPalSettings.Email}&currency_code=${config.PayPalSettings.Currency}&amount=${price}&item_name=${serviceEncoded}&no_shipping=1`
    
        const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setStyle('LINK')
                .setURL(`${url}`) 
                .setLabel(config.Locale.PayPalPayInvoice))

                const embed = new MessageEmbed()
                .setTitle(config.Locale.PayPalInvoiceTitle)
                .setColor(config.EmbedColors)
                .setThumbnail("https://www.freepnglogos.com/uploads/paypal-logo-png-7.png")
                .setDescription(config.Locale.PayPalInvoiceMsg)
                .addField(`• ${config.Locale.suggestionInformation}`, `> **${config.Locale.PayPalSeller}** ${interaction.user}\n> **${config.Locale.PayPalUser}** ${user}\n> **${config.Locale.PayPalPrice}** ${config.PayPalSettings.CurrencySymbol}${price} (${config.PayPalSettings.Currency})`)
                .addField(`• ${config.Locale.PayPalService}`, `> \`\`\`${service}\`\`\``)
                .setTimestamp()
                .setFooter({ text: `${user.tag}`, iconURL: `${user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 })}` })
                interaction.reply({ embeds: [embed], components: [row] })

                    let logsChannel; 
                    if(!config.paypalInvoice.ChannelID) logsChannel = interaction.guild.channels.cache.get(config.TicketSettings.LogsChannelID);
                    if(config.paypalInvoice.ChannelID) logsChannel = interaction.guild.channels.cache.get(config.paypalInvoice.ChannelID);

                    const log = new MessageEmbed()
                    .setColor("GREEN")
                    .setTitle(config.Locale.PayPalLogTitle)
                    .addField(`• ${config.Locale.logsExecutor}`, `> ${interaction.user}\n> ${interaction.user.tag}`)
                    .addField(`• ${config.Locale.PayPalUser}`, `> ${user}\n> ${user.tag}`)
                    .addField(`• ${config.Locale.PayPalPrice}`, `> ${config.PayPalSettings.CurrencySymbol}${price}`)
                    .addField(`• ${config.Locale.PayPalService}`, `> ${service}`)
                    .setTimestamp()
                    .setThumbnail(interaction.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))
                    .setFooter({ text: `${interaction.user.tag}`, iconURL: `${interaction.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 })}` })

                    if (logsChannel && config.paypalInvoice.Enabled) logsChannel.send({ embeds: [log] })

    }

}