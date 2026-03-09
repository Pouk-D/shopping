const msgs = {
  en: {
    home:'Home', products:'Products', cart:'Cart', orders:'My Orders',
    login:'Login', register:'Register', logout:'Logout', profile:'Profile',
    add_to_cart:'Add to Cart', buy_now:'Buy Now', checkout:'Checkout',
    search:'Search products...', all_categories:'All Categories',
    no_products:'No products found', loading:'Loading...',
    order_history:'Order History', no_orders:'No orders yet',
    chat_title:'Live Chat', chat_start:'Start Chat', chat_close:'Close Chat',
    chat_placeholder:'Type a message...', chat_send:'Send',
    chat_closed:'This chat has been closed',
    chat_welcome:'Hi! How can we help you today?',
    qty:'Qty', price:'Price', total:'Total', subtotal:'Subtotal',
    shipping:'Shipping', free:'Free', place_order:'Place Order',
    order_placed:'Order Placed!', continue_shopping:'Continue Shopping',
    name:'Full Name', email:'Email', password:'Password',
    sign_in:'Sign In', sign_up:'Sign Up', or:'or',
    hero_title:'Discover Amazing Products', hero_sub:'Shop the latest trends at unbeatable prices',
    shop_now:'Shop Now', view_all:'View All',
    in_stock:'In Stock', out_of_stock:'Out of Stock', left_in_stock:'left in stock',
    status:'Status', date:'Date', items:'Items',
  },
  lo: {
    home:'ໜ້າຫຼັກ', products:'ສິນຄ້າ', cart:'ກະຕ່າ', orders:'ການສັ່ງຂອງຂ້ອຍ',
    login:'ເຂົ້າສູ່ລະບົບ', register:'ລົງທະບຽນ', logout:'ອອກຈາກລະບົບ', profile:'ໂປຣໄຟລ',
    add_to_cart:'ໃສ່ກະຕ່າ', buy_now:'ຊື້ດຽວນີ້', checkout:'ຊຳລະເງິນ',
    search:'ຄົ້ນຫາສິນຄ້າ...', all_categories:'ທຸກໝວດ',
    no_products:'ບໍ່ພົບສິນຄ້າ', loading:'ກຳລັງໂຫຼດ...',
    order_history:'ປະຫວັດການສັ່ງ', no_orders:'ຍັງບໍ່ມີການສັ່ງ',
    chat_title:'ສົນທະນາສົດ', chat_start:'ເລີ່ມສົນທະນາ', chat_close:'ປິດການສົນທະນາ',
    chat_placeholder:'ພິມຂໍ້ຄວາມ...', chat_send:'ສົ່ງ',
    chat_closed:'ການສົນທະນານີ້ຖືກປິດແລ້ວ',
    chat_welcome:'ສະບາຍດີ! ພວກເຮົາຊ່ວຍທ່ານໄດ້ແນວໃດ?',
    qty:'ຈຳນວນ', price:'ລາຄາ', total:'ລວມ', subtotal:'ລວມຍ່ອຍ',
    shipping:'ຄ່າສົ່ງ', free:'ຟຣີ', place_order:'ສັ່ງຊື້',
    order_placed:'ສັ່ງຊື້ສຳເລັດ!', continue_shopping:'ຊື້ຕໍ່',
    name:'ຊື່ເຕັມ', email:'ອີເມລ', password:'ລະຫັດຜ່ານ',
    sign_in:'ເຂົ້າສູ່ລະບົບ', sign_up:'ລົງທະບຽນ', or:'ຫຼື',
    hero_title:'ຄົ້ນພົບສິນຄ້າດີ', hero_sub:'ຊື້ສິນຄ້າທັນສະໄໝໃນລາຄາທີ່ດີທີ່ສຸດ',
    shop_now:'ຊື້ດຽວນີ້', view_all:'ເບິ່ງທັງໝົດ',
    in_stock:'ມີໃນສາງ', out_of_stock:'ໝົດສາງ', left_in_stock:'ຍັງເຫຼືອ',
    status:'ສະຖານະ', date:'ວັນທີ', items:'ສິນຄ້າ',
  }
}

export const state = () => ({
  locale: process.client ? localStorage.getItem('locale') || 'en' : 'en'
})

export const mutations = {
  SET(state, locale) {
    state.locale = locale
    if (process.client) localStorage.setItem('locale', locale)
  }
}

export const getters = {
  t: state => key => msgs[state.locale]?.[key] ?? msgs.en[key] ?? key
}
