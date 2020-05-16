import {
    BaseEntity,
    BeforeInsert,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn
} from 'typeorm'
import { Command } from './Command'
import { User } from './User'

@Entity()
export class Report extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => User)
    @JoinColumn()
    user: User

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn()
    adminCreator: User

    @ManyToOne(() => Command, { nullable: true })
    @JoinColumn()
    command: Command

    @Column({ type: 'float' })
    points: number

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    date: Date

    @Column()
    isRegression: boolean

    @Column({ nullable: true })
    day: number

    @BeforeInsert()
    ensureInvariants() {
        if (this.isRegression) {
            const leqZeroPoints = this.points <= 0
            const zeroDay = this.day === 0

            if (!(leqZeroPoints && zeroDay)) {
                throw new Error(
                    `Regression reports must have negative points AND zero-day. Given: ${this.points} points and day ${this.day}`
                )
            }
        }
    }
}
