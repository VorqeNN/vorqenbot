const { Discord, MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu, Message, MessageAttachment } = require("discord.js");
const fs = require('fs');
const yaml = require("js-yaml")
const config = yaml.load(fs.readFileSync('./config.yml', 'utf8'))
const utils = require("../utils.js");

module.exports = async (client, interaction) => {

    async function CloseTicket() {
      if(config.TicketSettings.CloseConfirmation === false) await interaction.deferReply();
        let attachment = await utils.saveTranscript(interaction)

        let ticketAuthor = await client.users.cache.get(client.tickets.get(`${interaction.channel.id}`, "userID"))
        let claimUser = await client.users.cache.get(client.tickets.get(`${interaction.channel.id}`, "claimUser"))
        let totalMessages = await client.tickets.get(`${interaction.channel.id}`, "messages")
      
          const logEmbed = new MessageEmbed()
          logEmbed.setColor("RED")
          logEmbed.setTitle(config.Locale.ticketCloseTitle)
          logEmbed.addField(`• ${config.Locale.logsClosedBy}`, `> <@!${interaction.user.id}>\n> ${interaction.user.tag}`)
          logEmbed.addField(`• ${config.Locale.logsTicketAuthor}`, `> <@!${ticketAuthor.id}>\n> ${ticketAuthor.tag}`)
          if(claimUser && config.ClaimingSystem.Enabled) logEmbed.addField(`• ${config.Locale.ticketClaimedBy}`, `> <@!${claimUser.id}>\n> ${claimUser.tag}`)
          logEmbed.addField(`• ${config.Locale.logsTicket}`, `> #${interaction.channel.name}\n> ${client.tickets.get(`${interaction.channel.id}`, "ticketType")}`)
          logEmbed.setTimestamp()
          logEmbed.setThumbnail(interaction.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))
          logEmbed.setFooter({ text: `${config.Locale.totalMessagesLog} ${totalMessages}`, iconURL: `${interaction.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 })}` })

          let logsChannel; 
          if(!config.ticketClose.ChannelID) logsChannel = interaction.guild.channels.cache.get(config.TicketSettings.LogsChannelID);
          if(config.ticketClose.ChannelID) logsChannel = interaction.guild.channels.cache.get(config.ticketClose.ChannelID);

          let closeLogMsgID;
          if(logsChannel && config.ticketClose.Enabled && totalMessages < 1) await logsChannel.send({ embeds: [logEmbed] }).then(async function(msg) { closeLogMsgID = msg.id })
          if(logsChannel && config.ticketClose.Enabled && totalMessages >= 1) await logsChannel.send({ embeds: [logEmbed], files: [attachment] }).then(async function(msg) { closeLogMsgID = msg.id })
  
          if(ticketAuthor) {
          let ticketCloseLocale = config.TicketUserCloseDM.CloseEmbedMsg.replace(/{guildName}/g, `${interaction.guild.name}`);
          let ticketCloseReviewLocale = config.TicketReviewSettings.CloseEmbedReviewMsg.replace(/{guildName}/g, `${interaction.guild.name}`);
          if(config.TicketUserCloseDM.Enabled !== false || config.TicketReviewSettings.Enabled !== false) try{
            // Rating System
            const starMenu = new MessageActionRow()
            .addComponents(
              new MessageSelectMenu()
                .setCustomId('ratingSelect')
                .setPlaceholder(config.Locale.selectReview)
                .setMinValues(1)
                .setMaxValues(1)
                .addOptions([
                  {
                    label: '5 Star',
                    value: 'five_star',
                    emoji: '⭐',
                  },
                  {
                    label: '4 Star',
                    value: 'four_star',
                    emoji: '⭐',
                  },
                  {
                    label: '3 Star',
                    value: 'three_star',
                    emoji: '⭐',
                  },
                  {
                    label: '2 Star',
                    value: 'two_star',
                    emoji: '⭐',
                  },
                  {
                    label: '1 Star',
                    value: 'one_star',
                    emoji: '⭐',
                  },
                ]),
            );

            if(!claimUser) claimUser = config.Locale.notClaimedCloseDM

            const dmCloseEmbed = new MessageEmbed()
            dmCloseEmbed.setTitle(config.Locale.ticketClosedCloseDM)
            dmCloseEmbed.setDescription(ticketCloseLocale)
            if(config.TicketUserCloseDM.Enabled && config.TicketUserCloseDM.TicketInformation) dmCloseEmbed.addField(`${config.Locale.ticketInformationCloseDM}`, `> ${config.Locale.categoryCloseDM} ${client.tickets.get(`${interaction.channel.id}`, "ticketType")}\n> ${config.Locale.claimedByCloseDM} ${claimUser}\n> ${config.Locale.totalMessagesLog} ${client.tickets.get(`${interaction.channel.id}`, "messages")}`)
            dmCloseEmbed.setColor(config.EmbedColors)

            const dmCloseReviewEmbed = new MessageEmbed()
            dmCloseReviewEmbed.setTitle(config.Locale.ticketClosedCloseDM)
            dmCloseReviewEmbed.setDescription(ticketCloseReviewLocale)
            if(config.TicketUserCloseDM.Enabled && config.TicketUserCloseDM.TicketInformation) dmCloseReviewEmbed.addField(`${config.Locale.ticketInformationCloseDM}`, `> ${config.Locale.categoryCloseDM} ${client.tickets.get(`${interaction.channel.id}`, "ticketType")}\n> ${config.Locale.claimedByCloseDM} ${claimUser}\n> ${config.Locale.totalMessagesLog} ${client.tickets.get(`${interaction.channel.id}`, "messages")}`)
            dmCloseReviewEmbed.setColor(config.EmbedColors)

            let meetRequirement = true
            if(config.TicketReviewRequirements.Enabled) {
              if(client.tickets.get(`${interaction.channel.id}`, "messages") < config.TicketReviewRequirements.TotalMessages) meetRequirement = false
          }

          let reviewDMUserMsg;

          if(config.TicketReviewSettings.Enabled && meetRequirement && config.TicketUserCloseDM.Enabled && config.TicketUserCloseDM.SendTranscript) await ticketAuthor.send({ embeds: [dmCloseReviewEmbed], files: [attachment], components: [starMenu] }).then(async function(msg) { reviewDMUserMsg = msg.id })
          if(config.TicketReviewSettings.Enabled && meetRequirement && config.TicketUserCloseDM.Enabled && config.TicketUserCloseDM.SendTranscript === false) await ticketAuthor.send({ embeds: [dmCloseReviewEmbed], components: [starMenu] }).then(async function(msg) { reviewDMUserMsg = msg.id })
          if(config.TicketReviewSettings.Enabled && meetRequirement && config.TicketUserCloseDM.Enabled === false) await ticketAuthor.send({ embeds: [dmCloseReviewEmbed], components: [starMenu] }).then(async function(msg) { reviewDMUserMsg = msg.id })

          if(config.TicketReviewSettings.Enabled && meetRequirement === false && config.TicketUserCloseDM.Enabled && config.TicketUserCloseDM.SendTranscript) await ticketAuthor.send({ embeds: [dmCloseEmbed], files: [attachment] }).then(async function(msg) { reviewDMUserMsg = msg.id })
          if(config.TicketReviewSettings.Enabled && meetRequirement === false && config.TicketUserCloseDM.Enabled && config.TicketUserCloseDM.SendTranscript === false) await ticketAuthor.send({ embeds: [dmCloseEmbed] }).then(async function(msg) { reviewDMUserMsg = msg.id })
          //if(config.TicketReviewSettings.Enabled && meetRequirement === false && config.TicketUserCloseDM.Enabled === false) await ticketAuthor.send({ embeds: [dmCloseEmbed] }).then(async function(msg) { reviewDMUserMsg = msg.id })

          if(config.TicketReviewSettings.Enabled === false && config.TicketUserCloseDM.Enabled && config.TicketUserCloseDM.SendTranscript) await ticketAuthor.send({ embeds: [dmCloseEmbed], files: [attachment] })
          if(config.TicketReviewSettings.Enabled === false && config.TicketUserCloseDM.Enabled && config.TicketUserCloseDM.SendTranscript === false) await ticketAuthor.send({ embeds: [dmCloseEmbed] })

          if(config.TicketReviewSettings.Enabled) client.reviewsData.ensure(`${reviewDMUserMsg}`, {
            ticketCreatorID: ticketAuthor.id,
            guildID: interaction.guild.id,
            userID: ticketAuthor.id,
            tCloseLogMsgID: closeLogMsgID,
            reviewDMUserMsgID: reviewDMUserMsg,
            rating: 0,
            category: client.tickets.get(`${interaction.channel.id}`, "ticketType"),
            totalMessages: client.tickets.get(`${interaction.channel.id}`, "messages"),
        });

//
      }catch(e){
          console.log('\x1b[33m%s\x1b[0m', "[INFO] I tried to DM a user, but their DM's are locked.");
          //console.log(e)
          }
      }

      let dTime = config.TicketSettings.DeleteTime * 1000 
      let deleteTicketCountdown = config.Locale.deletingTicketMsg.replace(/{time}/g, `${config.TicketSettings.DeleteTime}`);
      const delEmbed = new MessageEmbed()
          .setDescription(deleteTicketCountdown)
          .setColor("RED")

      const ticketDeleteButton = new MessageButton()
      .setCustomId('closeTicket')
      .setLabel(config.Locale.CloseTicketButton)
      .setStyle(config.ButtonColors.closeTicket)
      .setEmoji(config.ButtonEmojis.closeTicket)
      .setDisabled(true)

      const ticketClaimButton = new MessageButton()
      .setCustomId('ticketclaim')
      .setLabel(config.Locale.claimTicketButton)
      .setEmoji(config.ButtonEmojis.ticketClaim)
      .setStyle(config.ButtonColors.ticketClaim)
      .setDisabled(true)
      
      let row1;
      if(config.ClaimingSystem.Enabled === false) row1 = new MessageActionRow().addComponents(ticketDeleteButton);
      if(config.ClaimingSystem.Enabled && !client.users.cache.get(client.tickets.get(`${interaction.channel.id}`, "claimUser"))) row1 = new MessageActionRow().addComponents(ticketDeleteButton, ticketClaimButton);

      await interaction.channel.messages.fetch(client.tickets.get(`${interaction.channel.id}`, "msgID")).then(msg => {
        msg.edit({ components: [row1] })
  })

      if(config.TicketSettings.CloseConfirmation === false) await interaction.followUp({ embeds: [delEmbed] })
      if(config.TicketSettings.CloseConfirmation && config.ArchiveTickets.Enabled === false) await interaction.followUp({ embeds: [delEmbed] })
      if(config.TicketSettings.CloseConfirmation && config.ArchiveTickets.Enabled) await interaction.reply({ embeds: [delEmbed] })

      setTimeout(async () => {
        await client.tickets.delete(interaction.channel.id)
        await interaction.channel.delete()
    }, dTime)

      let logMsg = `\n\n[${new Date().toLocaleString()}] [TICKET CLOSED] A ticket has been successfully closed, Close Confirmation: ${config.TicketSettings.CloseConfirmation}`;
      fs.appendFile("./logs.txt", logMsg, (e) => { 
        if(e) console.log(e);
      });

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

}

      let supportRole = false
      let tButton = client.tickets.get(`${interaction.channel.id}`, "button");
      if(tButton === "TicketButton1") {
        for(let i = 0; i < config.TicketButton1.SupportRoles.length; i++) {
            if(interaction.member.roles.cache.has(config.TicketButton1.SupportRoles[i])) supportRole = true;
        }
    } else if(tButton === "TicketButton2") {
        for(let i = 0; i < config.TicketButton2.SupportRoles.length; i++) {
            if(interaction.member.roles.cache.has(config.TicketButton2.SupportRoles[i])) supportRole = true;
          }
    } else if(tButton === "TicketButton3") {
        for(let i = 0; i < config.TicketButton3.SupportRoles.length; i++) {
            if(interaction.member.roles.cache.has(config.TicketButton3.SupportRoles[i])) supportRole = true;
          }
    } else if(tButton === "TicketButton4") {
        for(let i = 0; i < config.TicketButton4.SupportRoles.length; i++) {
            if(interaction.member.roles.cache.has(config.TicketButton4.SupportRoles[i])) supportRole = true;
          }
    } else if(tButton === "TicketButton5") {
        for(let i = 0; i < config.TicketButton5.SupportRoles.length; i++) {
            if(interaction.member.roles.cache.has(config.TicketButton5.SupportRoles[i])) supportRole = true;
          }
    }
      if(config.TicketSettings.RestrictTicketClose && supportRole === false) return interaction.reply({ content: config.Locale.restrictTicketClose, ephemeral: true })

      async function ArchiveTicket() {
        let tButton = client.tickets.get(`${interaction.channel.id}`, "button");
        let ticketAuthor = client.users.cache.get(client.tickets.get(`${interaction.channel.id}`, "userID"))

        const reOpenButton = new MessageButton()
        .setCustomId('reOpen')
        .setLabel(config.Locale.reOpenButton)
        .setEmoji(config.ButtonEmojis.reOpenTicket)
        .setStyle(config.ButtonColors.reOpenTicket)

        const transcriptButton = new MessageButton()
        .setCustomId('createTranscript')
        .setLabel(config.Locale.transcriptButton)
        .setEmoji(config.ButtonEmojis.createTranscript)
        .setStyle(config.ButtonColors.createTranscript)
    
        const deleteButton = new MessageButton()
        .setCustomId('deleteTicket')
        .setLabel(config.Locale.deleteTicketButton)
        .setEmoji(config.ButtonEmojis.deleteTicket)
        .setStyle(config.ButtonColors.deleteTicket)

        let row = new MessageActionRow().addComponents(reOpenButton, transcriptButton, deleteButton);

        let ticketClosedLocale = config.Locale.ticketClosedBy.replace(/{user}/g, `${interaction.user}`).replace(/{user-tag}/g, `${interaction.user.tag}`);
        const embed = new MessageEmbed()
        .setColor("RED")
        .setTitle(config.Locale.ticketClosedCloseDM)
        .setDescription(ticketClosedLocale)
        .setFooter({ text: `${interaction.user.tag}`, iconURL: `${interaction.user.displayAvatarURL({ dynamic: true })}` })
        .setTimestamp()

        if(config.ArchiveTickets.ViewClosedTicket === false) await interaction.channel.permissionOverwrites.cache.filter(o => o.type === "member").map(o => o.delete());
        if(config.ArchiveTickets.ViewClosedTicket) await interaction.channel.permissionOverwrites.cache.filter(o => o.type === "member" && o.id !== client.user.id).map(o => o.edit({ SEND_MESSAGES: false, VIEW_CHANNEL: true }));

      let msgID;
      if(config.TicketSettings.CloseConfirmation) await interaction.followUp({ embeds: [embed], components: [row], fetchReply: true }).then(async function(msg) { msgID = msg.id })
      if(config.TicketSettings.CloseConfirmation === false) await interaction.reply({ embeds: [embed], components: [row], fetchReply: true }).then(async function(msg) { msgID = msg.id })

      await client.tickets.set(interaction.channel.id, msgID, "archiveMsgID");
      if(config.ArchiveTickets.ViewClosedTicket === false) await client.tickets.set(interaction.channel.id, "Closed", "status");
      if(config.ArchiveTickets.RenameClosedTicket) await interaction.channel.setName(`closed-${ticketAuthor.username}`)


      if(tButton === "TicketButton1") {
        if(config.TicketButton1.ClosedCategoryID) await interaction.channel.setParent(config.TicketButton1.ClosedCategoryID, {lockPermissions: false})
        await config.TicketButton1.SupportRoles.forEach(sRoles => {
          role = interaction.guild.roles.cache.get(sRoles);
          if(role) {
              interaction.channel.permissionOverwrites.edit(role, {
                  SEND_MESSAGES: false,
                  VIEW_CHANNEL: true
              })
          }
    
      })

      } else if(tButton === "TicketButton2") {
        if(config.TicketButton2.ClosedCategoryID) await interaction.channel.setParent(config.TicketButton2.ClosedCategoryID, {lockPermissions: false})
        await config.TicketButton2.SupportRoles.forEach(sRoles => {
          role = interaction.guild.roles.cache.get(sRoles);
          if(role) {
              interaction.channel.permissionOverwrites.edit(role, {
                  SEND_MESSAGES: false,
                  VIEW_CHANNEL: true
              })
          }
      })

      } else if(tButton === "TicketButton3") {
        if(config.TicketButton3.ClosedCategoryID) await interaction.channel.setParent(config.TicketButton3.ClosedCategoryID, {lockPermissions: false})
        await config.TicketButton3.SupportRoles.forEach(sRoles => {
          role = interaction.guild.roles.cache.get(sRoles);
          if(role) {
              interaction.channel.permissionOverwrites.edit(role, {
                  SEND_MESSAGES: false,
                  VIEW_CHANNEL: true
              })
          }
      })

      } else if(tButton === "TicketButton4") {
        if(config.TicketButton4.ClosedCategoryID) await interaction.channel.setParent(config.TicketButton4.ClosedCategoryID, {lockPermissions: false})
        await config.TicketButton4.SupportRoles.forEach(sRoles => {
          role = interaction.guild.roles.cache.get(sRoles);
          if(role) {
              interaction.channel.permissionOverwrites.edit(role, {
                  SEND_MESSAGES: false,
                  VIEW_CHANNEL: true
              })
          }
      })

      } else if(tButton === "TicketButton5") {
        if(config.TicketButton5.ClosedCategoryID) await interaction.channel.setParent(config.TicketButton5.ClosedCategoryID, {lockPermissions: false})
        await config.TicketButton5.SupportRoles.forEach(sRoles => {
          role = interaction.guild.roles.cache.get(sRoles);
          if(role) {
              interaction.channel.permissionOverwrites.edit(role, {
                  SEND_MESSAGES: false,
                  VIEW_CHANNEL: true
              })
          }
      })
      }


      }

      // If ArchiveTickets is enabled
      if(config.ArchiveTickets.Enabled === true && interaction.customId === 'deleteTicket') {
        CloseTicket()

      } else if(config.ArchiveTickets.Enabled === true && interaction.customId !== 'deleteTicket') {

        const confirmButton = new MessageButton()
        .setCustomId('confirm')
        .setLabel(config.Locale.confirmCloseButton)
        .setStyle(config.ButtonColors.ticketConfirmClosure)

        const cancelButton = new MessageButton()
        .setCustomId('cancel')
        .setLabel(config.Locale.cancelCloseButton)
        .setStyle(config.ButtonColors.ticketCancelClosure)

        let row = new MessageActionRow().addComponents(confirmButton, cancelButton);

        let confirmCloseLocale = config.Locale.confirmCloseMsg.replace(/{user}/g, `<@!${interaction.user.id}>`).replace(/{user-tag}/g, `${interaction.user.tag}`);
        const embed = new MessageEmbed()
        .setTitle(config.Locale.confirmCloseTitle)
        .setColor("RED")
        .setDescription(confirmCloseLocale)
        .setTimestamp()
        if(config.TicketSettings.CloseConfirmation) await interaction.reply({ embeds: [embed], components: [row], fetchReply: true })
        if(config.TicketSettings.CloseConfirmation === false) return ArchiveTicket()

        const msg = await interaction.fetchReply();

        const filter = i => i.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({ filter, componentType: 'BUTTON', time: 60000 });

        if(config.TicketSettings.CloseConfirmation) collector.on('collect', async (i) => {
            if(i.customId === "confirm") {
            await collector.stop("used");
            await msg.delete()
            await ArchiveTicket()
          } else if(i.customId === "cancel") {
            await collector.stop("used");
            await i.reply({ content: config.Locale.ticketClosureCancel, ephemeral: true });
            await msg.delete()
          }
        });

        if(config.TicketSettings.CloseConfirmation) collector.on('end', (collected, reason) => {
          if(reason.toLowerCase() === "used" || !interaction.channel) return;
          msg.delete() // 9072c61d2067f8b39c00ac8646427e42 // 1658437646
        });



      } else if(config.TicketSettings.CloseConfirmation === false && config.ArchiveTickets.Enabled === false) {
          CloseTicket()
      } else if(config.TicketSettings.CloseConfirmation === true && config.ArchiveTickets.Enabled === false) {

        const confirmButton = new MessageButton()
        .setCustomId('confirm')
        .setLabel(config.Locale.confirmCloseButton)
        .setStyle(config.ButtonColors.ticketConfirmClosure)

        const cancelButton = new MessageButton()
        .setCustomId('cancel')
        .setLabel(config.Locale.cancelCloseButton)
        .setStyle(config.ButtonColors.ticketCancelClosure)

        let row = new MessageActionRow().addComponents(confirmButton, cancelButton);

        let confirmCloseLocale = config.Locale.confirmCloseMsg.replace(/{user}/g, `<@!${interaction.user.id}>`).replace(/{user-tag}/g, `${interaction.user.tag}`);
        const embed = new MessageEmbed()
        .setTitle(config.Locale.confirmCloseTitle)
        .setColor("RED")
        .setDescription(confirmCloseLocale)
        .setTimestamp()
        await interaction.reply({ embeds: [embed], components: [row], fetchReply: true })

        const msg = await interaction.fetchReply();

        const filter = i => i.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({ filter, componentType: 'BUTTON', time: 60000 });

        collector.on('collect', async (i) => {
            if(i.customId === "confirm") {
            await collector.stop("used");
            await CloseTicket()
            await msg.delete()
          } else if(i.customId === "cancel") {
            await collector.stop("used");
            await i.reply({ content: config.Locale.ticketClosureCancel, ephemeral: true });
            await msg.delete()
          }
        });

        collector.on('end', (collected, reason) => {
          if(reason.toLowerCase() === "used" || !interaction.channel) return;
          msg.delete()
        });

      }

};