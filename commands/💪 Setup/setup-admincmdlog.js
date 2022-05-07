var {
  MessageEmbed
} = require(`discord.js`);
var Discord = require(`discord.js`);
var config = require(`../../botconfig/config.json`);
var ee = require(`../../botconfig/embed.json`);
var emoji = require(`../../botconfig/emojis.json`);
var {
  dbEnsure
} = require(`../../handlers/functions`);
const { MessageButton, MessageActionRow, MessageSelectMenu } = require('discord.js')
module.exports = {
  name: "setup-admincmdlog",
  category: "💪 Setup",
  aliases: ["setupadmincmdlog", "cmdlog", "admincmdlog-setup", "admincmdlogsetup"],
  cooldown: 5,
  usage: "setup-admincmdlog  -->  Follow the Steps",
  description: "Enable/Disable logging administration command executions",
  memberpermissions: ["ADMINISTRATOR"],
  type: "info",
  run: async (client, message, args, cmduser, text, prefix, player, es, ls, GuildSettings) => {
    
    
    try {
      first_layer()
      async function first_layer(){
        let menuoptions = [
          {
            value: "Enable Log",
            description: `Define the Command Log Channel`,
            emoji: "✅"
          },
          {
            value: "Disable Log",
            description: `Disable the Admin Command Log`,
            emoji: "❌"
          },
          {
            value: "Show Settings",
            description: `Show Settings of the Admin Commands Log`,
            emoji: "📑"
          },
          {
            value: "Cancel",
            description: `Cancel and stop the Admin-Command-Log-Setup!`,
            emoji: "862306766338523166"
          }
        ]
        //define the selection
        let Selection = new MessageSelectMenu()
          .setCustomId('MenuSelection') 
          .setMaxValues(1) //OPTIONAL, this is how many values you can have at each selection
          .setMinValues(1) //OPTIONAL , this is how many values you need to have at each selection
          .setPlaceholder('Click me to setup the Admin-Command-Log') 
          .addOptions(
          menuoptions.map(option => {
            let Obj = {
              label: option.label ? option.label.substring(0, 50) : option.value.substring(0, 50),
              value: option.value.substring(0, 50),
              description: option.description.substring(0, 50),
            }
          if(option.emoji) Obj.emoji = option.emoji;
          return Obj;
         }))
        
        //define the embed
        let MenuEmbed = new MessageEmbed()
          .setColor(es.color)
          .setAuthor(client.getAuthor('Admin Setup', 'https://cdn.discordapp.com/emojis/892521772002447400.png?size=96', 'https://discord.gg/oryzen'))
          .setDescription(eval(client.la[ls]["cmds"]["setup"]["setup-ticket"]["variable2"]))
        //send the menu msg
        let menumsg = await message.reply({embeds: [MenuEmbed], components: [new MessageActionRow().addComponents(Selection)]})
        //Create the collector
        const collector = menumsg.createMessageComponentCollector({ 
          filter: i => i?.isSelectMenu() && i?.message.author?.id == client.user.id && i?.user,
          time: 90000
        })
        //Menu Collections
        collector.on('collect', async menu => {
          if (menu?.user.id === cmduser.id) {
            collector.stop();
            let menuoptiondata = menuoptions.find(v=>v.value == menu?.values[0])
            if(menu?.values[0] == "Cancel") return menu?.reply(eval(client.la[ls]["cmds"]["setup"]["setup-ticket"]["variable3"]))
            client.disableComponentMessage(menu);
            let SetupNumber = menu?.values[0].split(" ")[0]
            handle_the_picks(menu?.values[0], SetupNumber, menuoptiondata)
          }
          else menu?.reply({content: `<:no:904319985004978198> You are not allowed to do that! Only: <@${cmduser.id}>`, ephemeral: true});
        });
        //Once the Collections ended edit the menu message
        collector.on('end', collected => {
          menumsg.edit({embeds: [menumsg.embeds[0].setDescription(`~~${menumsg.embeds[0].description}~~`)], components: [], content: `${collected && collected.first() && collected.first().values ? `<a:success:907963383066816563> **Selected: \`${collected ? collected.first().values[0] : "Nothing"}\`**` : "❌ **NOTHING SELECTED - CANCELLED**" }`})
        });
      }

      async function handle_the_picks(optionhandletype, SetupNumber, menuoptiondata) {
        switch (optionhandletype) {
          case "Enable Log":
            {
              var tempmsg = await message.reply({embeds: [new Discord.MessageEmbed()
              .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-admincmdlog"]["variable4"]))
              .setColor(es.color)
              .setDescription(eval(client.la[ls]["cmds"]["setup"]["setup-admincmdlog"]["variable5"])).setFooter(client.getFooter(es))
            ]})
            var thecmd;
            await tempmsg.channel.awaitMessages({filter: m => m.author.id == message.author?.id, 
                max: 1,
                time: 90000,
                errors: ["time"]
            })
            .then(async collected => {
              var message = collected.first();
              if(!message) return message.reply( "NO MESSAGE SENT");
              if(message.mentions.channels.filter(ch=>ch.guild.id==message.guild.id).first()){
                await client.settings.set(`${message.guild.id}.adminlog`, message.mentions.channels.filter(ch=>ch.guild.id==message.guild.id).first().id)
                return message.reply({embeds: [new Discord.MessageEmbed()
                  .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-admincmdlog"]["variable6"]))
                  .setColor(es.color)
                  .setDescription(`If someone executes an Admin Command, an Information will be sent in that Channel`.substring(0, 2048))
                  .setFooter(client.getFooter(es))]
                });
              }
              else{
                return message.reply( "NO CHANNEL PINGED");
              }
            })
            .catch(e => {
              console.error(e)
              return message.reply({embeds: [new Discord.MessageEmbed()
                .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-admincmdlog"]["variable7"]))
                .setColor(es.wrongcolor)
                .setDescription(`Cancelled the Operation!`.substring(0, 2000))
                .setFooter(client.getFooter(es))]
              });
            })
          }
          break;
          case "Disable Log":
            {
              await client.settings.set(`${message.guild.id}.adminlog`, "no")
              return message.reply({embeds: [new Discord.MessageEmbed()
                .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-admincmdlog"]["variable8"]))
                .setColor(es.color)
                .setDescription(`If someone executes an Admin Command, **no** Information will be sent`.substring(0, 2048))
                .setFooter(client.getFooter(es))]
              });
            }
          break;
          case "Show Settings":
            {
              let thesettings = GuildSettings.adminlog
              return message.reply({embeds: [new Discord.MessageEmbed()
                .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-admincmdlog"]["variable9"]))
                .setColor(es.color)
                .setDescription(`**Channel:** ${thesettings == "no" ? "Not Setupped" : `<#${thesettings}> | \`${thesettings}\``}`.substring(0, 2048))
                .setFooter(client.getFooter(es))
              ]});
            }
          break;
        }
      }
    } catch (e) {
      console.log(String(e.stack).grey.bgRed)
      return message.reply({embeds: [new MessageEmbed()
        .setColor(es.wrongcolor).setFooter(client.getFooter(es))
        .setTitle(client.la[ls].common.erroroccur)
        .setDescription(eval(client.la[ls]["cmds"]["setup"]["setup-admincmdlog"]["variable11"]))
      ]});
    }
  },
};
/**
 * @INFO
 * Bot Coded by Tomato#6966 | https://discord.gg/oryzen
 * @INFO
 * Work for Milrato Development | https://milrato.eu
 * @INFO
 * Please mention him / Milrato Development, when using this Code!
 * @INFO
 */