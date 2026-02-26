export const locale: Record<string, string> = {
  // Options page
  "options.title": "Thai TM30 Helper - จัดการโปรไฟล์",
  "options.header": "Thai TM30 Helper",
  "options.subtitle": "บันทึกโปรไฟล์เพื่อกรอกแบบฟอร์ม TM30 อัตโนมัติ",
  "options.formTitle.add": "👤 เพิ่มบุคคลใหม่",
  "options.formTitle.edit": "👤 แก้ไขโปรไฟล์",
  "options.label.firstName": "ชื่อ",
  "options.label.lastName": "นามสกุล",
  "options.label.passportNo": "หมายเลขหนังสือเดินทาง",
  "options.label.nationality": "สัญชาติ",
  "options.label.gender": "เพศ",
  "options.label.birthDate": "วันเกิด",
  "options.label.phoneNo": "หมายเลขโทรศัพท์",
  "options.label.checkInDate": "วันที่เข้าพัก",
  "options.label.checkOutDate": "วันที่ออกจากที่พัก",
  "options.gender.male": "ชาย",
  "options.gender.female": "หญิง",
  "options.btn.save": "บันทึกโปรไฟล์",
  "options.btn.update": "อัปเดตโปรไฟล์",
  "options.btn.cancel": "ยกเลิก",
  "options.btn.edit": "แก้ไข",
  "options.btn.delete": "ลบ",
  "options.btn.exportExcel": "ส่งออกเป็น Excel",
  "options.btn.importExcel": "นำเข้าจาก Excel",
  "options.savedProfiles": "👥 โปรไฟล์ที่บันทึกไว้",
  "options.emptyState":
    "ยังไม่มีโปรไฟล์ที่บันทึกไว้ เพิ่มบุคคลแรกด้านบน",
  "options.noNationality": "ไม่พบสัญชาติ",
  "options.alert.birthDateFormat":
    "กรุณากรอกวันเกิดในรูปแบบ วว/ดด/ปปปป",
  "options.alert.selectNationality": "กรุณาเลือกสัญชาติจากรายการ",
  "options.alert.noProfiles": "ไม่มีโปรไฟล์ที่จะส่งออก",
  "options.alert.importSuccess": "นำเข้า {count} โปรไฟล์สำเร็จ",
  "options.alert.exportSuccess": "ส่งออกไฟล์ Excel สำเร็จ",
  "options.alert.importError":
    "เกิดข้อผิดพลาดในการนำเข้าไฟล์ กรุณาตรวจสอบรูปแบบ",
  "options.alert.emptySheet":
    "ชีตแรกไม่มีข้อมูล กรุณาเพิ่มข้อมูลในชีตแรกก่อนนำเข้า",
  "options.confirm.delete":
    "คุณแน่ใจหรือไม่ว่าต้องการลบโปรไฟล์นี้?",
  "options.importExport.title": "🔄 นำเข้า / ส่งออก",
  "options.importExport.description":
    "ส่งออกโปรไฟล์เป็น Excel สำหรับยื่น TM30 แบบกลุ่ม หรือนำเข้าจากแม่แบบที่มีอยู่",
  "options.language": "ภาษา",

  // Popup
  "popup.header": "Thai TM30 Helper",
  "popup.settings": "การตั้งค่า",
  "popup.addProfiles": "เพิ่มโปรไฟล์",
  "popup.emptyState": "ไม่พบโปรไฟล์ที่บันทึกไว้",
  "popup.editProfile": "แก้ไขโปรไฟล์",
  "popup.error.refresh":
    "ข้อผิดพลาด: กรุณารีเฟรชหน้าแบบฟอร์ม TM30 เพื่อเปิดใช้งานส่วนขยาย",
  "popup.error.wrongUrl":
    "กรุณาไปที่ https://tm30.immigration.go.th/tm30/#/external/ifa/add แล้วคลิกที่ชื่อบุคคลอีกครั้งเพื่อกรอกข้อมูล",
  "popup.leaveReview": "⭐ ให้คะแนนรีวิว",
  "popup.buyCoffee": "☕ เลี้ยงกาแฟ",
  "popup.madeBy": "สร้างโดย",

  // PIN
  "pin.title": "ใส่รหัส PIN",
  "pin.error": "รหัส PIN ไม่ถูกต้อง",
  "pin.attemptsLeft": "เหลือ {count} ครั้ง",
  "pin.forgot": "ลืมรหัส PIN? รีเซ็ตข้อมูลทั้งหมด",
  "pin.resetConfirm":
    "การดำเนินการนี้จะลบโปรไฟล์ที่บันทึกไว้ทั้งหมด คุณแน่ใจหรือไม่?",
  "pin.resetSuccess": "รีเซ็ตข้อมูลทั้งหมดแล้ว",

  // Security settings
  "options.security.title": "🔐 รหัส PIN",
  "options.security.description":
    "ปกป้องข้อมูลของคุณด้วยรหัส PIN",
  "options.security.newPin": "รหัส PIN ใหม่",
  "options.security.confirmPin": "ยืนยันรหัส PIN",
  "options.security.currentPin": "รหัส PIN ปัจจุบัน",
  "options.security.setPin": "ตั้งรหัส PIN",
  "options.security.changePin": "เปลี่ยนรหัส PIN",
  "options.security.removePin": "ลบรหัส PIN",
  "options.security.pinMismatch": "รหัส PIN ไม่ตรงกัน",
  "options.security.pinInvalid": "รหัส PIN ต้องเป็นตัวเลข 4 หลัก",
  "options.security.pinSet": "ตั้งรหัส PIN แล้ว",
  "options.security.pinChanged": "เปลี่ยนรหัส PIN แล้ว",
  "options.security.pinRemoved": "ลบรหัส PIN แล้ว",
  "options.security.wrongPin": "รหัส PIN ไม่ถูกต้อง",
  "options.security.lockTimeout": "ล็อคหลังไม่ใช้งาน",
  "options.security.badgeEnabled": "เปิดใช้งาน",
  "options.security.badgeNotSet": "ยังไม่ตั้ง",
  "options.security.timeout.30s": "30 วินาที",
  "options.security.timeout.1m": "1 นาที",
  "options.security.timeout.2m": "2 นาที",
  "options.security.timeout.3m": "3 นาที",
  "options.security.timeout.4m": "4 นาที",
  "options.security.timeout.5m": "5 นาที",
  "options.security.timeout.10m": "10 นาที",
  "options.madeBy": "สร้างโดย",
  "options.withLove": "ด้วย",

  // Consent modal
  "consent.title": "ข้อกำหนดการใช้งาน",
  "consent.intro":
    "ก่อนใช้งาน Thai TM30 Helper กรุณาอ่านและยอมรับข้อกำหนดต่อไปนี้:",
  "consent.point1.title": "คุณคือผู้ควบคุมข้อมูล",
  "consent.point1.text":
    "ข้อมูลส่วนบุคคลทั้งหมดที่คุณกรอกจะถูกจัดเก็บในเครื่องของคุณ คุณมีความรับผิดชอบในการประมวลผลข้อมูลนี้อย่างถูกกฎหมายภายใต้ PDPA และกฎหมายที่เกี่ยวข้อง",
  "consent.point2.title": "ความรับผิดชอบของคุณ",
  "consent.point2.text":
    "คุณต้องมีฐานทางกฎหมายที่ถูกต้อง (เช่น ความยินยอม) สำหรับการประมวลผลข้อมูลส่วนบุคคลของแขก ผู้เช่า หรือบุคคลที่สาม",
  "consent.point3.title":
    "ข้อจำกัดความรับผิดชอบของนักพัฒนา",
  "consent.point3.text":
    "นักพัฒนาไม่เก็บรวบรวม จัดเก็บ หรือมีสิทธิ์เข้าถึงข้อมูลใดๆ ที่คุณกรอก นักพัฒนาไม่รับผิดชอบต่อการใช้งานที่ไม่เหมาะสมหรือการละเมิด PDPA",
  "consent.footer":
    'การคลิก "ยอมรับ" หมายความว่าคุณได้อ่าน เข้าใจ และยอมรับข้อกำหนดเหล่านี้',
  "consent.accept": "ยอมรับ",
  "consent.viewFull": "ดูข้อกำหนดการใช้งานฉบับเต็ม",
};
