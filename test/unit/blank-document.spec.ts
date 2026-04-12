/**
 * Blank Document Generator — unit tests.
 * DOCX, XLSX, PPTX yaratuvchilar valid ZIP fayl qaytarishini tekshirish.
 */

import {
  createBlankDocx,
  createBlankXlsx,
  createBlankPptx,
} from '../../src/common/utils/blank-document.util'
import PizZip from 'pizzip'

describe('Blank Document Generator', () => {
  describe('createBlankDocx', () => {
    it('Buffer qaytaradi', () => {
      const result = createBlankDocx()
      expect(Buffer.isBuffer(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
    })

    it('valid ZIP formatda', () => {
      const result = createBlankDocx()
      expect(() => new PizZip(result)).not.toThrow()
    })

    it('word/document.xml mavjud', () => {
      const result = createBlankDocx()
      const zip = new PizZip(result)
      expect(zip.file('word/document.xml')).not.toBeNull()
    })

    it('[Content_Types].xml mavjud', () => {
      const result = createBlankDocx()
      const zip = new PizZip(result)
      expect(zip.file('[Content_Types].xml')).not.toBeNull()
    })
  })

  describe('createBlankXlsx', () => {
    it('Buffer qaytaradi', () => {
      const result = createBlankXlsx()
      expect(Buffer.isBuffer(result)).toBe(true)
    })

    it('valid ZIP formatda', () => {
      expect(() => new PizZip(createBlankXlsx())).not.toThrow()
    })

    it('xl/worksheets/sheet1.xml mavjud', () => {
      const zip = new PizZip(createBlankXlsx())
      expect(zip.file('xl/worksheets/sheet1.xml')).not.toBeNull()
    })
  })

  describe('createBlankPptx', () => {
    it('Buffer qaytaradi', () => {
      const result = createBlankPptx()
      expect(Buffer.isBuffer(result)).toBe(true)
    })

    it('valid ZIP formatda', () => {
      expect(() => new PizZip(createBlankPptx())).not.toThrow()
    })

    it('ppt/slides/slide1.xml mavjud', () => {
      const zip = new PizZip(createBlankPptx())
      expect(zip.file('ppt/slides/slide1.xml')).not.toBeNull()
    })
  })

  describe('Har fayl alohida instance', () => {
    it('ikkita docx turli buffer', () => {
      const a = createBlankDocx()
      const b = createBlankDocx()
      // Mazmun bir xil bo'lishi mumkin, lekin reference emas
      expect(a).not.toBe(b)
    })
  })
})
