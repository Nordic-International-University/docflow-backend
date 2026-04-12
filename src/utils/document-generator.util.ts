import { Logger } from '@nestjs/common'
import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'

export class DocumentGeneratorUtil {
  static generateDocumentFromTemplate(
    templateBuffer: Buffer,
    tags: Record<string, any>,
  ): Buffer {
    try {
      const zip = new PizZip(templateBuffer)
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      })

      doc.render(tags)

      const buffer = doc.getZip().generate({
        type: 'nodebuffer',
        compression: 'DEFLATE',
      })

      return buffer
    } catch (error) {
      Logger.error(`Error generating document from template: ${error?.message}`, error?.stack, 'DocumentGenerator')
      throw new Error(`Document generation failed: ${error.message}`)
    }
  }

  static validateTags(
    requiredTags: string[] | Record<string, any>,
    providedTags: Record<string, any>,
  ): { valid: boolean; missing: string[] } {
    const requiredTagsList = Array.isArray(requiredTags)
      ? requiredTags
      : Object.keys(requiredTags)

    const missing = requiredTagsList.filter((tag) => !(tag in providedTags))

    return {
      valid: missing.length === 0,
      missing,
    }
  }
}
