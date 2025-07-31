function persianToNumber(str) {
    // const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    // return Number(
    //   str
    //     .replace(/٬/g, '') // remove Persian thousands separator
    //     .split('')
    //     .map(ch => persianDigits.indexOf(ch) !== -1 ? persianDigits.indexOf(ch) : ch)
    //     .join('')
    // );
    if (!str) return 0;

    // Replace Persian and Arabic-Indic digits with English digits
    const englishStr = str
      .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))  // Persian
      .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)); // Arabic-Indic
  
    // Remove any thousands separators like "٬" or ","
    return Number(englishStr.replace(/[٬,]/g, ''));
  }

  console.log(persianToNumber(۸۹٬۰۰۰));