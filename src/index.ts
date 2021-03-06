import { Client, TextChannel, User as DiscordUser, Message } from 'discord.js'
import 'reflect-metadata'
import { createConnection } from 'typeorm'
import config from './config/config'
import { handleMessage } from './handlers/ingress'
import { getExitMessage, getWelcomeMessage } from './data/messages'
import { getChannelFromClient } from './util/discord'
import { tagR } from './util/tagger'
import { MiscServerRoles } from './data/roles'
import { Command } from './entity/Command'
const client = new Client()

// Initializes the connection to Discord and the database
async function init() {
    await createConnection()
    // Ensure that there are commands in the database
    const numberOfCommands = (await Command.findAndCount())[1]
    if (!numberOfCommands) {
        console.error('No commands found! Did you populate yet?')
        process.exit(1)
    }

    await client.login(config.key)
}

init().then(async () => {
    console.log('Discord and database initialization complete')

    client.on('message', async msg => {
        if (msg.author.bot) return
        if (!shouldRespond(msg)) return

        try {
            await handleMessage(msg)
        } catch (e) {
            msg.channel.send(
                `There was an error with the bot. The ${tagR(
                    MiscServerRoles.TechGuy
                )}s have been notified. Please temporarily refrain from running commands.`
            )

            const context = `**${msg.author.username}** tried to run **${msg.content}**\n\n`

            const botChannel = getChannelFromClient(client, config.channels.botTalk)
            ;(botChannel as TextChannel).send(context + e)
        }
    })

    client.on('guildMemberAdd', member => {
        const channel = getChannelFromClient(client, config.channels.newComers)
        ;(channel as TextChannel).send(getWelcomeMessage((member.user as DiscordUser).id))
    })

    client.on('guildMemberRemove', async member => {
        const channel = getChannelFromClient(client, config.channels.adminChannel)
        ;(channel as TextChannel).send(getExitMessage((member.user as DiscordUser).id))
    })
})

function shouldRespond(msg: Message) {
    return msg.content.startsWith('!') && msg.channel.id === config.channels.progressReporting
}
