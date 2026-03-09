const msgs = {
  en: {
    /* nav */
    dashboard:'Dashboard', orders:'Orders', products:'Products', categories:'Categories',
    users:'Users', customers:'Customers', chat:'Chat', reports:'Reports', logout:'Logout',
    view_store:'View Store',
    /* actions */
    search:'Search', save:'Save', cancel:'Cancel', delete:'Delete', edit:'Edit',
    create:'Create', update:'Update', manage:'Manage', view:'View', view_all:'View All', confirm:'Confirm',
    /* common */
    no_data:'No data found', loading:'Loading...', all:'All',
    name:'Name', email:'Email', password:'Password', role:'Role', joined:'Joined', date:'Date',
    /* dashboard */
    total_revenue:'Total Revenue', total_orders:'Total Orders', total_users:'Total Users',
    recent_orders:'Recent Orders', recent_users:'Recent Users', low_stock:'Low Stock',
    all_stocked:'All products well stocked 🎉', no_orders_yet:'No orders yet',
    order_id:'Order ID', customer:'Customer', items:'Items', total:'Total', status:'Status', actions:'Actions',
    /* products */
    product:'Product', category:'Category', price:'Price', stock:'Stock',
    add_product:'+ Add Product', new_product:'New Product', edit_product:'Edit Product',
    no_products_found:'No products found', out_of_stock:'Out of stock', in_stock:'in stock',
    description:'Description', images:'Images (one URL per line)',
    select_category:'Select category',
    delete_product:'Delete Product', delete_product_msg:'This product will be permanently deleted.',
    /* categories */
    add_category:'+ Add Category', new_category:'New Category', edit_category:'Edit Category',
    category_name:'Category Name', no_categories:'No categories yet. Add your first one.',
    products_label:'products', by_label:'by', edited_by:'edited by',
    delete_category:'Delete Category', delete_category_msg:'This category will be permanently deleted.',
    /* orders */
    all_statuses:'All Statuses', no_orders_found:'No orders found', order_total:'Order Total',
    last_updated_by:'Last updated by',
    tab_all:'All', tab_pending:'⏳ Pending', tab_processing:'⚙️ Processing',
    tab_shipped:'🚚 Shipped', tab_delivered:'✅ Delivered', tab_cancelled:'❌ Cancelled',
    /* users */
    total_customers:'Total Customers', admins:'Admins', regular_users:'Regular Users', super_admins:'Super Admins',
    make_admin:'Make Admin', revoke_admin:'Revoke Admin',
    reset_password:'Reset Password', new_password:'New Password',
    create_user:'Create User', admin_access_only:'Admin access only. Regular users are not permitted.',
    sign_in_continue:'Sign in to continue', sign_in:'Sign In', signing_in:'Signing in...',
    /* customers */
    customer_list:'Customer List', total_spent:'Total Spent', last_order:'Last Order', orders_count:'Orders',
    /* chat */
    close_room:'Close Chat', send:'Send', type_message:'Type a message...',
    room_closed:'This chat has been closed', open_chats:'Open', all_chats:'All Chats',
    select_chat:'Select a chat to start messaging', online:'Online', closed:'Closed', open:'Open',
    /* users roles */
    admin:'Admin', user:'User', super_admin:'Super Admin',
    you:'You',
    /* reports */
    by_customer:'👤 By Customer', by_date:'📅 By Date', by_product:'📦 By Product / Category',
    period:'Period', qty_sold:'Qty Sold', revenue_share:'Revenue Share',
    top_buyer:'Top Buyer', daily:'Daily', weekly:'Weekly', monthly:'Monthly',
    avg_order:'Avg Order', by_product_label:'By Product', by_category:'By Category',
  },
  lo: {
    /* nav */
    dashboard:'ໜ້າຫຼັກ', orders:'ການສັ່ງຊື້', products:'ສິນຄ້າ', categories:'ໝວດໝູ່',
    users:'ຜູ້ໃຊ້', customers:'ລູກຄ້າ', chat:'ສົນທະນາ', reports:'ລາຍງານ', logout:'ອອກຈາກລະບົບ',
    view_store:'ເບິ່ງຮ້ານ',
    /* actions */
    search:'ຄົ້ນຫາ', save:'ບັນທຶກ', cancel:'ຍົກເລີກ', delete:'ລົບ', edit:'ແກ້ໄຂ',
    create:'ສ້າງ', update:'ອັບເດດ', manage:'ຈັດການ', view:'ເບິ່ງ', view_all:'ເບິ່ງທັງໝົດ', confirm:'ຢືນຢັນ',
    /* common */
    no_data:'ບໍ່ພົບຂໍ້ມູນ', loading:'ກຳລັງໂຫຼດ...', all:'ທັງໝົດ',
    name:'ຊື່', email:'ອີເມລ', password:'ລະຫັດຜ່ານ', role:'ບົດບາດ', joined:'ເຂົ້າຮ່ວມ', date:'ວັນທີ',
    /* dashboard */
    total_revenue:'ລາຍຮັບທັງໝົດ', total_orders:'ການສັ່ງຊື້ທັງໝົດ', total_users:'ຜູ້ໃຊ້ທັງໝົດ',
    recent_orders:'ການສັ່ງຊື້ລ່າສຸດ', recent_users:'ຜູ້ໃຊ້ລ່າສຸດ', low_stock:'ສິນຄ້າໃກ້ໝົດ',
    all_stocked:'ສິນຄ້າທຸກຢ່າງມີພຽງພໍ 🎉', no_orders_yet:'ຍັງບໍ່ມີການສັ່ງ',
    order_id:'ລະຫັດສັ່ງ', customer:'ລູກຄ້າ', items:'ສິນຄ້າ', total:'ລວມ', status:'ສະຖານະ', actions:'ການກະທຳ',
    /* products */
    product:'ສິນຄ້າ', category:'ໝວດ', price:'ລາຄາ', stock:'ສາງ',
    add_product:'+ ເພີ່ມສິນຄ້າ', new_product:'ສິນຄ້າໃໝ່', edit_product:'ແກ້ໄຂສິນຄ້າ',
    no_products_found:'ບໍ່ພົບສິນຄ້າ', out_of_stock:'ໝົດສາງ', in_stock:'ໃນສາງ',
    description:'ລາຍລະອຽດ', images:'ຮູບພາບ (ໜຶ່ງ URL ຕໍ່ແຖວ)',
    select_category:'ເລືອກໝວດ',
    delete_product:'ລົບສິນຄ້າ', delete_product_msg:'ສິນຄ້ານີ້ຈະຖືກລົບຖາວອນ.',
    /* categories */
    add_category:'+ ເພີ່ມໝວດ', new_category:'ໝວດໃໝ່', edit_category:'ແກ້ໄຂໝວດ',
    category_name:'ຊື່ໝວດ', no_categories:'ຍັງບໍ່ມີໝວດ. ເພີ່ມໝວດທຳອິດ.',
    products_label:'ສິນຄ້າ', by_label:'ໂດຍ', edited_by:'ແກ້ໄຂໂດຍ',
    delete_category:'ລົບໝວດ', delete_category_msg:'ໝວດນີ້ຈະຖືກລົບຖາວອນ.',
    /* orders */
    all_statuses:'ທຸກສະຖານະ', no_orders_found:'ບໍ່ພົບການສັ່ງ', order_total:'ລວມການສັ່ງ',
    last_updated_by:'ອັບເດດລ່າສຸດໂດຍ',
    tab_all:'ທັງໝົດ', tab_pending:'⏳ ລໍຖ້າ', tab_processing:'⚙️ ກຳລັງດຳເນີນ',
    tab_shipped:'🚚 ສົ່ງແລ້ວ', tab_delivered:'✅ ສົ່ງຮອດ', tab_cancelled:'❌ ຍົກເລີກ',
    /* users */
    total_customers:'ລູກຄ້າທັງໝົດ', admins:'ຜູ້ດູແລ', regular_users:'ຜູ້ໃຊ້ທົ່ວໄປ', super_admins:'ຜູ້ດູແລສູງສຸດ',
    make_admin:'ຕັ້ງເປັນຜູ້ດູແລ', revoke_admin:'ຖອດຖອນຜູ້ດູແລ',
    reset_password:'ຕັ້ງລະຫັດຜ່ານໃໝ່', new_password:'ລະຫັດຜ່ານໃໝ່',
    create_user:'ສ້າງຜູ້ໃຊ້', admin_access_only:'ສຳລັບຜູ້ດູແລເທົ່ານັ້ນ.',
    sign_in_continue:'ເຂົ້າສູ່ລະບົບ', sign_in:'ເຂົ້າລະບົບ', signing_in:'ກຳລັງເຂົ້າ...',
    /* customers */
    customer_list:'ລາຍຊື່ລູກຄ້າ', total_spent:'ໃຊ້ຈ່າຍທັງໝົດ', last_order:'ການສັ່ງຊື້ລ່າສຸດ', orders_count:'ການສັ່ງ',
    /* chat */
    close_room:'ປິດການສົນທະນາ', send:'ສົ່ງ', type_message:'ພິມຂໍ້ຄວາມ...',
    room_closed:'ການສົນທະນານີ້ຖືກປິດແລ້ວ', open_chats:'ເປີດຢູ່', all_chats:'ທັງໝົດ',
    select_chat:'ເລືອກການສົນທະນາ', online:'ອອນລາຍ', closed:'ປິດ', open:'ເປີດ',
    /* user roles */
    admin:'ຜູ້ດູແລ', user:'ຜູ້ໃຊ້', super_admin:'ຜູ້ດູແລສູງສຸດ',
    you:'ທ່ານ',
    /* reports */
    by_customer:'👤 ລາຍລູກຄ້າ', by_date:'📅 ລາຍວັນ', by_product:'📦 ລາຍສິນຄ້າ/ໝວດ',
    period:'ຊ່ວງເວລາ', qty_sold:'ຈຳນວນຂາຍ', revenue_share:'ສ່ວນແບ່ງລາຍຮັບ',
    top_buyer:'ລູກຄ້າດີ', daily:'ລາຍວັນ', weekly:'ລາຍອາທິດ', monthly:'ລາຍເດືອນ',
    avg_order:'ສະເລ່ຍ', by_product_label:'ຕາມສິນຄ້າ', by_category:'ຕາມໝວດ',
  }
}

export const state = () => ({
  locale: process.client ? localStorage.getItem('admin_locale') || 'en' : 'en'
})

export const mutations = {
  SET(state, locale) {
    state.locale = locale
    if (process.client) localStorage.setItem('admin_locale', locale)
  }
}

export const getters = {
  t: state => key => msgs[state.locale]?.[key] ?? msgs.en[key] ?? key
}
