import { Global, Module } from '@nestjs/common'
import { AbilityFactory } from './ability.factory'

/**
 * Global CASL module — barcha modullarda inject qilinadi.
 * Import kerak emas, chunki @Global().
 */
@Global()
@Module({
  providers: [AbilityFactory],
  exports: [AbilityFactory],
})
export class CaslModule {}
