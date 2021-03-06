import { Message, GuildMember } from 'discord.js'
import { Command } from '../../entity/Command'
import { User } from '../../entity/User'
import AbstractHandler from '../abstract/AbstractHandler'

export default class LeaderboardHandler extends AbstractHandler {
    public constructor() {
        super(false, false, false, false)
    }

    protected async handler(user: User, _cmd: Command, msg: Message): Promise<any> {
        const users = await User.find({ order: { points: 'DESC' } })

        let result = ''
        for (let i = 0; i < users.length; i++) {
            const currUser = users[i]
            let discordUser: GuildMember
            try {
                discordUser = await msg.guild.members.fetch(currUser.discordId)
            } catch (e) {
                continue
            }
            let toPush = `${i + 1}. ${discordUser.user.username} ⇆ ${currUser.points}`

            if (user.discordId === currUser.discordId) {
                toPush = `**${toPush}**`
            }

            result += `${toPush}\n`
        }

        return msg.channel.send(result)
    }
}
