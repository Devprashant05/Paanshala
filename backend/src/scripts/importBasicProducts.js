import mongoose from "mongoose";
import dotenv from "dotenv";

import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";

dotenv.config();

/* =========================================
MONGODB CONNECT
========================================= */

await mongoose.connect(`${process.env.MONGO_URI}/${process.env.DB_NAME}`);

console.log("✅ MongoDB Connected");

/* =========================================
PRODUCT DATA
========================================= */

const products = [
    {
        name: "Mango Chocolate Coated Paan",
        description:
            "Discover a delightful twist on traditional paan with our mango chocolate coated paan! Made with fresh mango puree and premium chocolate, this fusion of flavors will leave your taste buds tingling with delight. A must-try for anyone looking to add a little excitement to their dessert routine.",
        additionalInfo:
            "Discover a delightful twist on traditional paan with our mango chocolate coated paan! Made with fresh mango puree and premium chocolate, this fusion of flavors will leave your taste buds tingling with delight. A must-try for anyone looking to add a little excitement to their dessert routine.",
        parentCategory: "Fresh Paan",
        subcategory: "Chocolate Coated Paan",
        isPaan: true,
    },
    {
        name: "Pineapple Chocolate Coated Paan",
        description:
            "Experience a burst of flavors like never before with our Pineapple Chocolate Coated Paan. Our unique creation combines the sweetness of pineapple, the richness of chocolate, and the aromatic essence of paan into one delightful confection. Handmade with care and attention to detail, our Pineapple Chocolate Coated Paan is a true delicacy that will take your taste buds on a journey to paradise. Treat yourself to something extraordinary with",
        additionalInfo:
            "Experience a burst of flavors like never before with our Pineapple Chocolate Coated Paan. Our unique creation combines the sweetness of pineapple, the richness of chocolate, and the aromatic essence of paan into one delightful confection. Handmade with care and attention to detail, our Pineapple Chocolate Coated Paan is a true delicacy that will take your taste buds on a journey to paradise. Treat yourself to something extraordinary with",
        parentCategory: "Fresh Paan",
        subcategory: "Chocolate Coated Paan",
        isPaan: true,
    },
    {
        name: "Strawberry Chocolate Coated Paan",
        description:
            "Experience a delightful fusion of flavors with our Strawberry Chocolate Coated Paan. The juicy sweetness of strawberries combines harmoniously with the velvety smoothness of chocolate, while the aromatic paan adds a refreshing finish to each bite. Indulge in this unique treat that offers a perfect balance of sweet, rich, and refreshing notes. Savor the taste of innovation with every bite of our Strawberry Chocolate Coated Paan.",
        additionalInfo:
            "Experience a delightful fusion of flavors with our Strawberry Chocolate Coated Paan. The juicy sweetness of strawberries combines harmoniously with the velvety smoothness of chocolate, while the aromatic paan adds a refreshing finish to each bite. Indulge in this unique treat that offers a perfect balance of sweet, rich, and refreshing notes. Savor the taste of innovation with every bite of our Strawberry Chocolate Coated Paan.",
        parentCategory: "Fresh Paan",
        subcategory: "Chocolate Coated Paan",
        isPaan: true,
    },
    {
        name: "Dark Chocolate Coated Paan",
        description:
            "Elevate your snacking experience with our Dark Chocolate Coated Paan. Made with premium ingredients, this delectable treat offers a harmonious blend of dark chocolate and paan flavors that will leave your taste buds wanting more. Enjoy a moment of indulgence with every bite!",
        additionalInfo:
            "Elevate your snacking experience with our Dark Chocolate Coated Paan. Made with premium ingredients, this delectable treat offers a harmonious blend of dark chocolate and paan flavors that will leave your taste buds wanting more. Enjoy a moment of indulgence with every bite!",
        parentCategory: "Fresh Paan",
        subcategory: "Chocolate Coated Paan",
        isPaan: true,
    },
    {
        name: "White Chocolate Coated Paan",
        description:
            "Paanshala the delicious blend of traditional paan and creamy white chocolate with our all-new White Chocolate Coated Paan. A perfect combination of sweet and savory, this treat is sure to satisfy your taste buds. Each bite will transport you to the streets of India, where paan is a staple for dessert lovers. Treat yourself with our heavenly white chocolate coated paan today!",
        additionalInfo:
            "Paanshala the delicious blend of traditional paan and creamy white chocolate with our all-new White Chocolate Coated Paan. A perfect combination of sweet and savory, this treat is sure to satisfy your taste buds. Each bite will transport you to the streets of India, where paan is a staple for dessert lovers. Treat yourself with our heavenly white chocolate coated paan today!",
        parentCategory: "Fresh Paan",
        subcategory: "Chocolate Coated Paan",
        isPaan: true,
    },
    {
        name: "Tuti Fruity Paan",
        description:
            "Treat your taste buds to a burst of fruity goodness with Tutty Fruity Paan. Made with the finest ingredients, this flavorful snack is sure to become your new favorite indulgence. Experience the perfect blend of sweetness and freshness in every bite.",
        additionalInfo:
            "Treat your taste buds to a burst of fruity goodness with Tutty Fruity Paan. Made with the finest ingredients, this flavorful snack is sure to become your new favorite indulgence. Experience the perfect blend of sweetness and freshness in every bite.",
        parentCategory: "Fresh Paan",
        subcategory: "Fresh Fruit Paan",
        isPaan: true,
    },
    {
        name: "Strawberry Fruit Paan",
        description:
            "Strawberry Paan enjoy a touch of elegance. Each paan is handcrafted with the freshest ingredients and blended to create a tantalizing flavour that&#8217;s perfect for any occasion. The juicy sweetness of strawberries meets the decadent delight of chocolate, making this paan one worth savoring.",
        additionalInfo:
            "Paanshala Strawberry Paan enjoy a touch of elegance. Each paan is handcrafted with the freshest ingredients and blended to create a tantalizing flavour that&#8217;s perfect for any occasion. The juicy sweetness of strawberries meets the decadent delight of chocolate, making this paan one worth savoring.",
        parentCategory: "Fresh Paan",
        subcategory: "Fresh Fruit Paan",
        isPaan: true,
    },
    {
        name: "Nutella Chocolate Paan",
        description:
            "Nutella Paan is the irresistible combination &#8211; Nutella &amp; Paan! The smooth and creamy texture of Nutella blends perfectly with the refreshing with paan, making for an unforgettable flavour experience. Whether you&#8217;re adding it to your toast or drizzling it over your ice cream, Nutella Paan will elevate any dish. Treat yourself today and discover the taste of heaven!",
        additionalInfo:
            "Nutella Paan is  the irresistible combination &#8211; Nutella &amp; Paan! The smooth and creamy texture of Nutella blends perfectly with the refreshing with paan, making for an unforgettable flavour experience. Whether you&#8217;re adding it to your toast or drizzling it over your ice cream, Nutella Paan will elevate any dish. Treat yourself today and discover the taste of heaven!",
        parentCategory: "Fresh Paan",
        subcategory: "Premium Chocolate Paan",
        isPaan: true,
    },
    {
        name: "Orange Chocolate Coated Paan",
        description:
            "Orange chocolate coated paan is made with fresh, handpicked oranges and high-quality betel leaves. Delicious combination of paan and juicy orange. The sweet and tangy flavour of the fruit perfectly complements the slightly bitter taste of paan. Give it a try and experience a burst of flavour in every bite!",
        additionalInfo:
            "Orange chocolate coated paan is made with fresh, handpicked oranges and high-quality betel leaves. Delicious combination of paan and juicy orange. The sweet and tangy flavour of the fruit perfectly complements the slightly bitter taste of paan. Give it a try and experience a burst of flavour in every bite!",
        parentCategory: "Fresh Paan",
        subcategory: "Chocolate Coated Paan",
        isPaan: true,
    },
    {
        name: "Milk Chocolate Coated Paan",
        description:
            "Milk Chocolate Coated Paan artisanal chocolatiers have combined the goodness of milk chocolate with the exotic flavoursof paan to create a true masterpiece that is perfect for any occasion. Whether you&#8217;re looking for a delicious treat to share with family and friends or simply want to indulge your sweet tooth, our Milk Chocolate Coated Paan will surely satisfy your cravings and leave you wanting more. So what are you waiting for? Try it out and experience the magic for yourself!",
        additionalInfo:
            "Milk Chocolate Coated Paan artisanal chocolatiers have combined the goodness of milk chocolate with the exotic flavoursof paan to create a true masterpiece that is perfect for any occasion. Whether you&#8217;re looking for a delicious treat to share with family and friends or simply want to indulge your sweet tooth, our Milk Chocolate Coated Paan will surely satisfy your cravings and leave you wanting more. So what are you waiting for? Try it out and experience the magic for yourself!",
        parentCategory: "Fresh Paan",
        subcategory: "Chocolate Coated Paan",
        isPaan: true,
    },
    {
        name: "Kewra Flavoure Paan",
        description:
            "Kewra Flavor Paan! This exciting blend of fresh betel leaves, scented with kewra essence, is a delightful mix of sweet, tangy, and refreshing flavors. Loaded with a mouthwatering combination of gulkand, coconut, and rose petals, this Paan is sure to leave you feeling satisfied!",
        additionalInfo:
            "Kewra Flavor Paan! This exciting blend of fresh betel leaves, scented with kewra essence, is a delightful mix of sweet, tangy, and refreshing flavors. Loaded with a mouthwatering combination of gulkand, coconut, and rose petals, this Paan is sure to leave you feeling satisfied!",
        parentCategory: "Fresh Paan",
        subcategory: "Dry Fruit Paan",
        isPaan: true,
    },
    {
        name: "Honey Kismis Paan",
        description:
            "Treat yourself to a burst of flavor with our Honey Kismis Paan! Each bite of this mouthwatering dessert is a harmonious mix of honey sweetness and juicy raisins. Wrapped in a fresh betel leaf, this paan is a classic Indian delicacy that will leave you craving for more.",
        additionalInfo:
            "Treat yourself to a burst of flavor with our Honey Kismis Paan! Each bite of this mouthwatering dessert is a harmonious mix of honey sweetness and juicy raisins. Wrapped in a fresh betel leaf, this paan is a classic Indian delicacy that will leave you craving for more.",
        parentCategory: "Fresh Paan",
        subcategory: "Dry Fruit Paan",
        isPaan: true,
    },
    {
        name: "Walnut Honey Paan",
        description:
            "Walnut Honey Paan! A new twist on the classic flavour, you&#8217;ve got to try our walnut Honey Paan! Made with real walnut, sweet honey, and fragrant betel leaves, this treat is sure to satisfy your cravings. With its crunchy texture and delightful taste, it&#8217;s the perfect way to indulge yourself anytime.",
        additionalInfo:
            "Walnut Honey Paan! A new twist on the classic flavour, you&#8217;ve got to try our walnut Honey Paan! Made with real walnut, sweet honey, and fragrant betel leaves, this treat is sure to satisfy your cravings. With its crunchy texture and delightful taste, it&#8217;s the perfect way to indulge yourself anytime.",
        parentCategory: "Fresh Paan",
        subcategory: "Dry Fruit Paan",
        isPaan: true,
    },
    {
        name: "Caramal Chocolate Paan",
        description:
            "Treat your taste buds to a delightful experience with our Caramel Chocolate Paan. Each bite is a perfect blend of sweet caramel, decadent chocolate, and aromatic betel leaf. Whether you&#8217;re a paan aficionado or just looking to try something new, this fusion of flavors is sure to leave you craving for more.",
        additionalInfo:
            "Treat your taste buds to a delightful experience with our Caramel Chocolate Paan. Each bite is a perfect blend of sweet caramel, decadent chocolate, and aromatic betel leaf. Whether you&#8217;re a paan aficionado or just looking to try something new, this fusion of flavors is sure to leave you craving for more.",
        parentCategory: "Fresh Paan",
        subcategory: "Premium Chocolate Paan",
        isPaan: true,
    },
    {
        name: "Canberry Fruit Paan",
        description:
            "Treat yourself to a symphony of taste with our Canberry Fruit Paan! The perfect combination of tangy cranberries and aromatic paan leaf creates a refreshing and mouthwatering snack. Whether you&#8217;re a paan lover or looking to try something new, this delicious treat is sure to satisfy your cravings.",
        additionalInfo:
            "Treat yourself to a symphony of taste with our Canberry Fruit Paan! The perfect combination of tangy cranberries and aromatic paan leaf creates a refreshing and mouthwatering snack. Whether you&#8217;re a paan lover or looking to try something new, this delicious treat is sure to satisfy your cravings.",
        parentCategory: "Fresh Paan",
        subcategory: "Fresh Fruit Paan",
        isPaan: true,
    },
    {
        name: "Orange Fruit Paan",
        description:
            "Orange fruit paan is made with fresh, handpicked oranges and high-quality betel leaves. Delicious combination of paan and juicy orange. The sweet and tangy flavour of the fruit perfectly complements the slightly bitter taste of paan. Give it a try and experience a burst of flavour in every bite!",
        additionalInfo:
            "Paanshala orange fruit paan is made with fresh, handpicked oranges and high-quality betel leaves. Delicious combination of paan and juicy orange. The sweet and tangy flavour of the fruit perfectly complements the slightly bitter taste of paan. Give it a try and experience a burst of flavour in every bite!",
        parentCategory: "Fresh Paan",
        subcategory: "Fresh Fruit Paan",
        isPaan: true,
    },
    {
        name: "Kitkat Chocolate Paan",
        description:
            "Kitkat Chocolate Paan. This unique twist to the traditional paan brings together the rich and creamy flavor of chocolate with the refreshing taste of paan, making it a delicious treat for your taste buds. Perfect to satisfy your cravings and a great way to unwind after a long day!",
        additionalInfo:
            "Kitkat Chocolate Paan. This unique twist to the traditional paan brings together the rich and creamy flavor of chocolate with the refreshing taste of paan, making it a delicious treat for your taste buds. Perfect to satisfy your cravings and a great way to unwind after a long day!",
        parentCategory: "Fresh Paan",
        subcategory: "Premium Chocolate Paan",
        isPaan: true,
    },
    {
        name: "Mango Fruit Paan",
        description:
            "Paanshala Mango Fruit Paan! Made with the juiciest mangoes and traditional paan ingredients, this dessert will leave you craving for more. The perfect blend of sweet and tangy makes it an ideal treat for all ages. Freshen up your taste buds with our delicious Mango Fruit Paan today and experience a burst of flavours!",
        additionalInfo:
            "Paanshala Mango Fruit Paan! Made with the juiciest mangoes and traditional paan ingredients, this dessert will leave you craving for more. The perfect blend of sweet and tangy makes it an ideal treat for all ages. Freshen up your taste buds with our delicious Mango Fruit Paan today and experience a burst of flavours!",
        parentCategory: "Fresh Paan",
        subcategory: "Fresh Fruit Paan",
        isPaan: true,
    },
    {
        name: "Gulab Flavour Paan",
        description:
            "Gulab Flavour Paan is the perfect treat for something exotic and soothing you. You&#8217;ll feel the gentle embrace of rose petals with each bite, transporting you to a state of relaxation and satisfaction. Our paan leaves are hand-picked to ensure the best quality, so you can enjoy the full-bodied flavour and texture of our delicious pan.",
        additionalInfo:
            "Paanshala Gulab Flavour Paan is the perfect treat for something exotic and soothing you. You&#8217;ll feel the gentle embrace of rose petals with each bite, transporting you to a state of relaxation and satisfaction. Our paan leaves are hand-picked to ensure the best quality, so you can enjoy the full-bodied flavour and texture of our delicious pan.",
        parentCategory: "Fresh Paan",
        subcategory: "Fresh Fruit Paan",
        isPaan: true,
    },
    {
        name: "Meetha Paan",
        description:
            "Meetha Paan experience the taste of tradition. Perfect for any occasion, our paan is made with the finest ingredients and is sure to leave your mouth watering. The perfect blend of sweetness and spiciness will tantalize your taste buds and leave you feeling satisfied.",
        additionalInfo:
            "Meetha Paan experience the taste of tradition. Perfect for any occasion, our paan is made with the finest ingredients and is sure to leave your mouth watering. The perfect blend of sweetness and spiciness will tantalize your taste buds and leave you feeling satisfied.",
        parentCategory: "Fresh Paan",
        subcategory: "Meetha & Sada Paan",
        isPaan: true,
    },
    {
        name: "Kesar Flavour Paan",
        description:
            "Kesar Flavour Paan! Handcrafted with care and attention to detail, our paan is infused with the sweet and aromatic flavour of kesar to create a decadent and delicious treat. Perfect for any occasion, our paan is the perfect way to indulge your sweet tooth and enjoy a taste of exotic India. So why wait? Try our Kesar Flavour Paan today and discover the ultimate in flavour and satisfaction!",
        additionalInfo:
            "Kesar Flavour Paan! Handcrafted with care and attention to detail, our paan is infused with the sweet and aromatic flavour of kesar to create a decadent and delicious treat. Perfect for any occasion, our paan is the perfect way to indulge your sweet tooth and enjoy a taste of exotic India. So why wait? Try our Kesar Flavour Paan today and discover the ultimate in flavour and satisfaction!",
        parentCategory: "Fresh Paan",
        subcategory: "Flavour Meetha Paan",
        isPaan: true,
    },
    {
        name: "Almond Honey Paan",
        description:
            "Almond Honey Paan! This delicious treat combines the rich creaminess of almonds with the sweet and refreshing taste of honey and paan leaves. Whether you&#8217;re sharing it with friends or keeping it all to yourself, this snack is sure to impress. So dig in and enjoy the one-of-a-kind taste of Almond Honey Paan!",
        additionalInfo:
            "Almond Honey Paan! This delicious treat combines the rich creaminess of almonds with the sweet and refreshing taste of honey and paan leaves. Whether you&#8217;re sharing it with friends or keeping it all to yourself, this snack is sure to impress. So dig in and enjoy the one-of-a-kind taste of Almond Honey Paan!",
        parentCategory: "Fresh Paan",
        subcategory: "Dry Fruit Paan",
        isPaan: true,
    },
    {
        name: "Gems Chocolate Paan",
        description:
            "Gems Chocolate Paan is a mouth-watering combination of traditional paan filling and delicious chocolate gems! Indulge in the goodness of chocolate and paan with every bite. It&#8217;s the perfect sweet treat after dinner.",
        additionalInfo:
            "Gems Chocolate Paan is a mouth-watering combination of traditional paan filling and delicious chocolate gems! Indulge in the goodness of chocolate and paan with every bite. It&#8217;s the perfect sweet treat after dinner.",
        parentCategory: "Fresh Paan",
        subcategory: "Premium Chocolate Paan",
        isPaan: true,
    },
    {
        name: "Kaju-Katli Paan",
        description:
            "Cashewnut Paan! Made with the finest cashew nuts and other high-quality ingredients, our Paan is a delightful blend of sweet and nutty flavours. It&#8217;s perfect for those who want to indulge in something different and delicious. Whether you&#8217;re a Paan enthusiast or just curious, our cashewnut Paan is guaranteed to satisfy your cravings.",
        additionalInfo:
            "Cashewnut Paan! Made with the finest cashew nuts and other high-quality ingredients, our Paan is a delightful blend of sweet and nutty flavours. It&#8217;s perfect for those who want to indulge in something different and delicious. Whether you&#8217;re a Paan enthusiast or just curious, our cashewnut Paan is guaranteed to satisfy your cravings.",
        parentCategory: "Fresh Paan",
        subcategory: "Flavour Meetha Paan",
        isPaan: true,
    },
    {
        name: "Blueberry Fruit Paan",
        description:
            "Blueberry Fruit Paan it&#8217;s the perfect combination of the traditional Indian dessert with the juicy sweetness of blueberries. Our Blueberry Fruit Paan is made with fresh blueberries, coconut, and a variety of dried fruits like raisins and cranberries, all wrapped in a betel leaf. The flavours and textures are out of this world, and once you take a bite, you won&#8217;t want any other dessert!",
        additionalInfo:
            "Paanshala Blueberry Fruit Paan it&#8217;s the perfect combination of the traditional Indian dessert with the juicy sweetness of blueberries. Our Blueberry Fruit Paan is made with fresh blueberries, coconut, and a variety of dried fruits like raisins and cranberries, all wrapped in a betel leaf. The flavours and textures are out of this world, and once you take a bite, you won&#8217;t want any other dessert!",
        parentCategory: "Fresh Paan",
        subcategory: "Fresh Fruit Paan",
        isPaan: true,
    },
    {
        name: "Blackberry Fruit Paan",
        description:
            "Blackberry Fruit Paan. Handcrafted with love and care, this mouth-watering paan is infused with the rich, fruity taste of blackcurrants, blending perfectly with the traditional paan ingredients to create a unique and refreshing flavour. Perfect for a post-meal treat, our Blackberry Fruit Paan is the perfect way to indulge your sweet tooth in a guilt-free way.",
        additionalInfo:
            "Blackberry Fruit Paan. Handcrafted with love and care, this mouth-watering paan is infused with the rich, fruity taste of blackcurrants, blending perfectly with the traditional paan ingredients to create a unique and refreshing flavour. Perfect for a post-meal treat, our Blackberry Fruit Paan is the perfect way to indulge your sweet tooth in a guilt-free way.",
        parentCategory: "Fresh Paan",
        subcategory: "Fresh Fruit Paan",
        isPaan: true,
    },
    {
        name: "Banarasi Sada Paan",
        description:
            "Banarasi Sada Paan the rich culture of Indian food. Savor the luxurious blend of flavours and textures, capturing the essence of the Banaras region. Our Sada Paan is perfect for post-meal refreshment or as a gift to your loved ones. Try it now and experience a taste of India!",
        additionalInfo:
            "Banarasi Sada Paan the rich culture of Indian food. Savor the luxurious blend of flavours and textures, capturing the essence of the Banaras region. Our Sada Paan is perfect for post-meal refreshment or as a gift to your loved ones. Try it now and experience a taste of India!",
        parentCategory: "Fresh Paan",
        subcategory: "Meetha & Sada Paan",
        isPaan: true,
    },
    {
        name: "Banarasi Meetha Paan",
        description:
            "Banarasi Meetha Paan a delicious blend of natural ingredients that will tantalize your taste buds. Our expertly crafted paan is made from the freshest betel leaves, mixed with aromatic ingredients , and a generous sprinkling of sweet  flavours. Each bite is a unique experience that will leave you feeling satisfied and refreshed. Try Banarasi Meetha Paan today and treat yourself to the ultimate in Indian indulgence.",
        additionalInfo:
            "Banarasi Meetha Paan a delicious blend of natural ingredients that will tantalize your taste buds. Our expertly crafted paan is made from the freshest betel leaves, mixed with aromatic ingredients , and a generous sprinkling of sweet  flavours. Each bite is a unique experience that will leave you feeling satisfied and refreshed. Try Banarasi Meetha Paan today and treat yourself to the ultimate in Indian indulgence.",
        parentCategory: "Fresh Paan",
        subcategory: "Flavour Meetha Paan",
        isPaan: true,
    },
    {
        name: "Chandan Flavour Paan",
        description:
            "Chandan Flavour Paan! This unique flavour is a perfect amalgamation of the refreshing scent of sandalwood and the sweet notes of Paan. Take a bite and let the flavour dance on your taste buds. This paan is sure to leave an unforgettable taste and a lasting memory.",
        additionalInfo:
            "Chandan Flavour Paan! This unique flavour is a perfect amalgamation of the refreshing scent of sandalwood and the sweet notes of Paan. Take a bite and let the flavour dance on your taste buds. This paan is sure to leave an unforgettable taste and a lasting memory.",
        parentCategory: "Fresh Paan",
        subcategory: "Flavour Meetha Paan",
        isPaan: true,
    },
    {
        name: "Masala Candy",
        description:
            "Indulge in the irresistible taste of Masala Candy from Paanshala! These delightful treats are perfect for satisfying your sweet tooth and giving your taste buds a spicy kick. Our masala candy is made from the finest ingredients and is available in a variety of flavors such as mango, imli, and chatpata.\nWhether you&#8217;re looking to book a paan stall for a party or simply craving a sweet and spicy treat, Paanshala has got you covered. Our masala candy is a must-try for any fan of pan masala and candy. You can try our candy in place of other pan masala candies such as Pan Pasand Pan Masala, Candyman Tadka Soft Masala Candy, and Pan Masala Toffee.\nExperience the perfect blend of sweet and spicy flavors with Paanshala&#8217;s Masala Candy. From the refreshing taste of mango to the tangy flavor of imli, our masala candies are sure to satisfy your cravings. So, visit our store or order online and treat yourself to the ultimate candy indulgence!\n\nBrand: Paanshala",
        additionalInfo:
            "Paanshala the spicy-sweet taste of Masala Candy! Made with the perfect blend of black pepper and sugar, these candies are a flavor explosion in your mouth. Perfect for satisfying your sweet tooth with a little kick of spice.",
        parentCategory: "Candy & More",
        subcategory: "",
        isPaan: false,
    },
    {
        name: "Paan Candy",
        description:
            "Indulge in the rich and aromatic taste of Paan Candy, exclusively available at Paanshala. Whether you want to enjoy it after a meal or serve it at a party, our Paan Candy is the perfect blend of sweetness and tanginess that is sure to leave your taste buds wanting more.\nMade with the finest ingredients, our Paan Candy is an excellent alternative to traditional paan that can be enjoyed anytime, anywhere.\nSatisfy your cravings with our range of Paan Candy options, including Pan Pasand Candy, Paan Toffee, and Banarasi Paan Candy. Our candy options are perfect for those who prefer a no-spit solution to traditional paan. Our candy is just like Candysaga Paan Corner and Paan Smith Candy and as popular among customers because of its distinct flavour and quality.\nAt Paanshala, we pride ourselves on providing the best quality paan candy at affordable prices. Our Pan Pasand Toffee and other candy options are available both in-store and online, making it easy for you to stock up for your next party or event. Trust us to satisfy your sweet tooth with our delicious Paan Flavour Candy.\n\nBrand: Paanshala",
        additionalInfo:
            "Paanshala Paan Candy is a unique in candy flavours; you won&#8217;t want to miss out on our paan candy. Made with the traditional ingredients of paan, you&#8217;ll experience a burst of exotic and tantalizing flavors with every bite. Our paan candy is perfect for sharing, so grab a bag and indulge in the deliciousness of Indian cuisine with friends and family!\n&nbsp;",
        parentCategory: "Candy & More",
        subcategory: "",
        isPaan: false,
    },
    {
        name: "Orange Candy",
        description:
            "Looking for a tangy and sweet candy that is perfect for satisfying your sweet tooth? Look no further than Paanshala&#8217;s orange candy! Made with real orange slices and packed with juicy orange flavor, these orange slice candies are the perfect treat for any time of day. As a top paan supplier in Delhi, we pride ourselves on providing our customers with the highest quality sweets and candies.\nOur orange slice candy is made with real orange slices, giving it a natural and refreshing flavor that is sure to delight your taste buds. Each piece is bursting with juicy orange goodness, making it the perfect snack to enjoy on the go or to share with friends.\nWhether you&#8217;re looking for a sweet and tangy treat to enjoy on your own, or you need a bulk supply of orange candies for your next event or party, Paanshala has got you covered. Our orange slice candy is available in a variety of sizes and quantities to suit your needs, and we offer convenient online ordering for your convenience.\nSo why wait? Treat yourself to the delicious and refreshing taste of Paanshala&#8217;s orange slice candy today and experience the best of what our top paan supplier in Delhi has to offer!\n\nBrand: Paanshala",
        additionalInfo:
            "Paanshala the sweet citrus flavour of our irresistible Orange Candy! These chewy treats are perfect for satisfying your sweet tooth or brightening up a dull afternoon. Whether you&#8217;re snacking on them solo or sharing with friends, our orange candies are sure to delight your taste buds.",
        parentCategory: "Candy & More",
        subcategory: "",
        isPaan: false,
    },
    {
        name: "Sondi Harad",
        description:
            "Sondi Harad, also known as dry myrobalan, is a popular ingredient used in traditional Indian medicine and Ayurveda. At Paanshala, we offer high-quality Sondi Harad that can be used for various medicinal purposes. Our Sondi Harad is sourced from reliable suppliers and is free from any harmful additives.\nSondi Harad is believed to have a range of health benefits, including improving digestion, reducing inflammation, and boosting immunity. It is also used as a natural remedy for respiratory issues, skin problems, and hair loss. Our Sondi Harad can be added to various dishes to enhance their flavor and nutritional value.\nApart from Sondi Harad, we also offer a range of other quality products at Paanshala. Whether you&#8217;re looking for paan candy, juicy fruit balls, or orange candies, we have got you covered. As the top paan supplier in Delhi, we are committed to providing our customers with the best products and services. Order from us today and experience the difference in quality and taste!\n\nBrand: Paanshala",
        additionalInfo:
            "Paanshala Sondi Harad is a digestive products helps soothe common stomach ailments and strengthen the digestive system. Sondhi Harad is a game-changer when it comes to natural remedies. This powerful herb is packed with vitamins and minerals and has been used for centuries to promote wellness.\nFrom keeping your digestion running smoothly to improving your mood and energy levels, it&#8217;s definitely worth adding to your daily routine. Give it a try and feel the difference!",
        parentCategory: "Digestives",
        subcategory: "Pachak Delights",
        isPaan: false,
    },
    {
        name: "Juicy Fruit Ball",
        description:
            "Looking for a refreshing and juicy burst of flavor? Look no further than the Juicy Fruit Ball available at Paanshala! As one of the best paan suppliers in the area, we pride ourselves on offering unique and high-quality products like the Juicy Fruit Ball.\nMade with a blend of natural fruit flavors, these Juicy Fruit Balls are the perfect combination of sweet and tangy. They&#8217;re a great way to freshen your breath after a meal, or simply satisfy your sweet tooth. Plus, they come in a convenient and portable size, so you can take them on the go!\nPair the Juicy Fruit Ball with other delicious treats from Paanshala, such as Sondi Harad and Pudina Goli, for an unforgettable flavor experience. Our commitment to using only the highest quality ingredients means you can trust that every bite will be delicious and satisfying.\nSo if you&#8217;re in the market for a unique and refreshing treat, look no further than the Juicy Fruit Ball at Paanshala. With our dedication to quality and customer satisfaction, you can&#8217;t go wrong!\n\nBrand: Paanshala",
        additionalInfo:
            "Paanshala Juicy Fruit Balls are the perfect solution for anyone with a sweet tooth! Made from a unique blend of juicy fruits and natural ingredients, each bite is a burst of flavor that will have you coming back for more. Ideal for sharing with friends or as a special treat for yourself, these little balls of joy are sure to satisfy.",
        parentCategory: "Candy & More",
        subcategory: "",
        isPaan: false,
    },
    {
        name: "Pudina Goli",
        description:
            "Looking for a refreshing and tangy taste that will leave you wanting more? Look no further than Paanshala&#8217;s Pudina Goli! Made from the finest ingredients, this mint-flavored candy is the perfect way to refresh your breath and soothe your taste buds. With its crisp, clean flavor and invigorating aroma, Pudina Goli is sure to be a hit with anyone who enjoys a fresh, minty taste.\nAt Paanshala, we take pride in providing our customers with the best possible products. That&#8217;s why our Pudina Goli is made with only the finest quality ingredients, ensuring a delicious and satisfying taste every time. Whether you&#8217;re looking for a quick pick-me-up, or just want to freshen your breath after a meal, our Pudina Goli is the perfect choice.\nSo why wait? Order your Pudina Goli from Paanshala today and experience the delicious taste and refreshing flavor that only our meetha paan online store can provide. And while you&#8217;re at it, be sure to try our other mouth-watering treats, like Juicy Fruit Ball and Nimboo Goli, for a complete and satisfying taste experience.\n\nBrand: Paanshala",
        additionalInfo:
            "Paanshala pudina goli is made out of rich quality mint leaves, organic herbs and spices, Are you looking for a tasty treat that&#8217;s bursting with flavor? Look no further than Pudina Goli! Our mouthwatering mint candies are packed with a unique blend of spices that will leave you coming back for more.\nWhether you&#8217;re enjoying them on your own or sharing with friends, Pudina Goli is sure to satisfy your sweet tooth. So what are you waiting for? Try some today and join the legions of fans who can&#8217;t get enough of our delicious treats!",
        parentCategory: "Digestives",
        subcategory: "Daily Digest",
        isPaan: false,
    },
    {
        name: "Nimboo Goli",
        description:
            "Looking for a tangy, refreshing treat? Look no further than Nimboo Goli from Paanshala! Our Nimboo Goli is the perfect blend of sweet and sour, with a burst of lemony flavor that will leave your taste buds craving more. Made with high-quality ingredients, this candy is perfect for anyone who loves a good snack.\nAt Paanshala, we take pride in being the top Paan supplier in Delhi, providing our customers with the best quality products at affordable prices. Whether you&#8217;re looking for a sweet treat to enjoy on your own or want to book a Paan stall for an event, we&#8217;ve got you covered. Our Nimboo Goli pairs perfectly with our other popular offerings, such as our Pudina Goli and Methi Pachak.\nSo why wait? Treat yourself to our delicious Nimboo Goli today and experience the taste sensation that only Paanshala can provide!\n\nBrand: Paanshala",
        additionalInfo:
            "Paanshala Nimboo Goli is made out of rich quality lemon juice, organic herbs and spices, Say goodbye to boring snacks and hello to Nimboo Goli! These delicious candy balls pack a punch of lemony goodness that will keep you coming back for more.\nTreat yourself to a burst of flavor and give your taste buds a reason to smile. Whether you need a quick snack at work or a little something to satisfy your sweet tooth, Nimboo Goli is the perfect choice.",
        parentCategory: "Digestives",
        subcategory: "Daily Digest",
        isPaan: false,
    },
    {
        name: "Methi Pachak",
        description:
            "Looking for a flavorful and healthy snack? Look no further than Methi Pachak, available at Paanshala! Methi Pachak is a mouthwatering combination of fenugreek and lemon, providing a tangy and refreshing taste. Made with natural ingredients, this snack is not only delicious but also has numerous health benefits. It helps in digestion, reduces acidity, and is also a great source of dietary fiber.\nPaanshala is the go-to place for Methi Pachak, whether you need it for your personal snack stash or want to add it to your paan counter for weddings or other events. We offer the best quality Methi Pachak in like brands, including Patanjali Methi Pachak and Patanjali Methi Nimbu.\nMethi Pachak is also known as Pachak Methi or Methi Nimbu Pachak. It is a popular Indian snack that has been enjoyed for generations. Whether you&#8217;re craving something tangy and spicy or want to add some flavor to your paan counter, Methi Pachak is the perfect choice. So, visit Paanshala today to get your hands on this delicious and healthy snack!\n\nBrand: Paanshala",
        additionalInfo:
            "Paanshala Methi Pachak is a delicious and healthy snack that not only satisfies your hunger but also helps in aiding digestion. Made with the goodness of Fenugreek, Methi Pachak! Made with the finest quality Fenugreek, this snack packs a punch of flavor and helps in maintaining your digestive health. Perfect for those who want to snack guilt-free!",
        parentCategory: "Digestives",
        subcategory: "Pachak Delights",
        isPaan: false,
    },
    {
        name: "Khatta Aam Papad",
        description:
            "Indulge in the tangy goodness of Khatta Aam Papad, available exclusively at Paanshala. Made from the choicest mangoes, this delectable treat is a must-try for all mango lovers. Whether you&#8217;re looking for a quick snack or a unique addition to your dessert platter, Khatta Aam Papad is the perfect choice.\nAt Paanshala, we take great pride in offering the best quality products to our customers. Our Khatta Aam Papad is made using traditional recipes and techniques, ensuring a rich and authentic taste. You can trust us to deliver the same great taste every time you order.\nHosting a wedding or event? Our Paan stall is the perfect addition to your festivities. Our Khatta Aam Papad, along with our other delicious treats like Methi Pachak and Jeera Goli, is sure to delight your guests.\nOrder Khatta Aam Papad online from Paanshala and indulge in the sweet and tangy flavors of this classic treat. Try our Kala Aam Papad too for a different flavor profile!\n\nBrand: Paanshala",
        additionalInfo:
            "Paanshala Khatta Aam Papad makes one&#8217;s mouth water! Our renowned recipe has been passed down generations to ensure the same authentic flavor every time. Be it for yourself or as a thoughtful gift, it&#8217;s bound to win hearts. Try it today!",
        parentCategory: "Digestives",
        subcategory: "Daily Digest",
        isPaan: false,
    },
    {
        name: "Jeera Goli",
        description:
            "Looking for a refreshing burst of flavor? Try our Jeera Goli! These tangy and spicy candies are the perfect treat for any occasion. Made with the highest quality ingredients, our Jeera Goli will leave your taste buds dancing. Paanshala is proud to be the best paan supplier in Delhi, and we know that our customers love our Jeera Goli as much as we do.\nPerfect for weddings or any special event, our Jeera Goli are a great way to add a little spice to your day. And if you&#8217;re in the mood for something sweet, be sure to try our Khatta Aam Papad or Imli Candy. Our selection of candies is unmatched, and we know you&#8217;ll love every bite. So why wait? Order your Jeera Goli today and get ready to experience the ultimate flavor explosion!\n\nBrand: Paanshala",
        additionalInfo:
            "Paanshala Jeera Goli bursting with the intense flavour of cumin and other natural spices, this yummy treat is sure to become your new go-to snack. Not only is it delicious, but it also promotes healthy digestion and alleviates bloating. So why settle for bland snacks when you can have our tasty Jeera Goli? Order now and give your taste buds a reason to dance!",
        parentCategory: "Digestives",
        subcategory: "Daily Digest",
        isPaan: false,
    },
    {
        name: "Imli Candy",
        description:
            "Paanshala Imli candy is a delicious Indian treat that packs a punch of tangy and sweet flavors in every bite! Made with tamarind as the main ingredient, this candy is a must-have for those who love the perfect balance of sweet and sour.",
        additionalInfo:
            "Paanshala Imli candy is a delicious Indian treat that packs a punch of tangy and sweet flavors in every bite! Made with tamarind as the main ingredient, this candy is a must-have for those who love the perfect balance of sweet and sour.",
        parentCategory: "Digestives",
        subcategory: "Daily Digest",
        isPaan: false,
    },
    {
        name: "Hing Goli",
        description:
            "Paanshala Hing Goli is made out of rich quality hing , organic herbs and spices, Indulge in the goodness of hing goli – a savory and crunchy snack that&#8217;s sure to tantalize your taste buds. Made with high-quality lentils and infused with the goodness of hing, this snack is a perfect blend of health and taste. Share it with your friends and family or enjoy it all by yourself!",
        additionalInfo:
            "Paanshala Hing Goli is made out of rich quality hing , organic herbs and spices, Indulge in the goodness of hing goli – a savory and crunchy snack that&#8217;s sure to tantalize your taste buds. Made with high-quality lentils and infused with the goodness of hing, this snack is a perfect blend of health and taste. Share it with your friends and family or enjoy it all by yourself!",
        parentCategory: "Digestives",
        subcategory: "Pachak Delights",
        isPaan: false,
    },
    {
        name: "Gummy Jelly",
        description:
            "Paanshala Gummy Jelly candy is a type of chewy candy that is popular all over the world. It is made by mixing sugar, glucose syrup, and water with gelatin or pectin to create a soft, chewy texture. Sweet, juicy, and totally addictive – that&#8217;s what our Gummy Jelly is all about! Made from the finest natural ingredients and packed with all the flavor and nutrition of fresh fruit, these jellies are a true delight for your taste buds. Whether you&#8217;re a fan of classic fruit flavors like strawberry, raspberry, and orange, or prefer something a little more exotic like mango or pineapple, we&#8217;ve got you covered. So why not treat yourself to a fruity snack that&#8217;s as delicious as it is wholesome?",
        additionalInfo:
            "Paanshala Gummy Jelly candy is a type of chewy candy that is popular all over the world. It is made by mixing sugar, glucose syrup, and water with gelatin or pectin to create a soft, chewy texture. Sweet, juicy, and totally addictive – that&#8217;s what our Gummy Jelly is all about! Made from the finest natural ingredients and packed with all the flavor and nutrition of fresh fruit, these jellies are a true delight for your taste buds. Whether you&#8217;re a fan of classic fruit flavors like strawberry, raspberry, and orange, or prefer something a little more exotic like mango or pineapple, we&#8217;ve got you covered. So why not treat yourself to a fruity snack that&#8217;s as delicious as it is wholesome?",
        parentCategory: "Candy & More",
        subcategory: "",
        isPaan: false,
    },
    {
        name: "Coconut Laddu",
        description:
            "Paanshala Coconut Laddu made with love and passion, this heavenly dessert is a treat for the taste buds. Handcrafted with fresh coconuts, sugar and milk, our laddus are soft, juicy and melt-in-your-mouth delicious. Best served chilled, it&#8217;s the perfect dessert to end a scrumptious meal. Try it today!",
        additionalInfo:
            "Paanshala Coconut Laddu made with love and passion, this heavenly dessert is a treat for the taste buds. Handcrafted with fresh coconuts, sugar and milk, our laddus are soft, juicy and melt-in-your-mouth delicious. Best served chilled, it&#8217;s the perfect dessert to end a scrumptious meal. Try it today!\n&nbsp;",
        parentCategory: "Candy & More",
        subcategory: "",
        isPaan: false,
    },
    {
        name: "Coconut Candy",
        description:
            "Love the taste of coconut? You won&#8217;t be able to get enough of our coconut candy! Each piece is packed with coconut goodness, offering a truly satisfying treat for any occasion. Whether you&#8217;re on-the-go or simply craving something sweet, our candy is the perfect choice. Try it today and experience the ultimate coconut candy sensation!",
        additionalInfo:
            "Love the taste of coconut? You won&#8217;t be able to get enough of our coconut candy! Each piece is packed with coconut goodness, offering a truly satisfying treat for any occasion. Whether you&#8217;re on-the-go or simply craving something sweet, our candy is the perfect choice. Try it today and experience the ultimate coconut candy sensation!\n&nbsp;",
        parentCategory: "Candy & More",
        subcategory: "",
        isPaan: false,
    },
    {
        name: "Amla Candy",
        description:
            "Paanshala  Amla Candy! This candy is the perfect blend of sweet and tangy, making it an ideal option for those who want to indulge in something delicious without compromising on nutrition. Whether you&#8217;re at your office or on the go, our Amla candy is the perfect candy to keep you going.",
        additionalInfo:
            "Paanshala  Amla Candy! This candy is the perfect blend of sweet and tangy, making it an ideal option for those who want to indulge in something delicious without compromising on nutrition. Whether you&#8217;re at your office or on the go, our Amla candy is the perfect candy to keep you going.",
        parentCategory: "Candy & More",
        subcategory: "",
        isPaan: false,
    },
    {
        name: "Calcutta Sada Paan",
        description:
            "Looking for an authentic and flavorful Kolkata paan? Paanshala has got you covered with our Calcutta Sada Paan, a popular and traditional paan variety that&#8217;s sure to satisfy your taste buds. Made with the finest ingredients, our Calcutta Sada Paan features a unique blend of flavors that&#8217;s both sweet and refreshing.\nOur Calcutta Sada Paan is made with a variety of high-quality ingredients, including betel leaf, areca nut, and lime paste, as well as various spices and flavorings that give it its distinctive taste. We take great care in selecting only the best ingredients for our paan, ensuring that each bite is as flavorful and aromatic as the last.\nAt Paanshala, we understand the importance of authenticity when it comes to traditional paan varieties like Calcutta Sada. That&#8217;s why we use only the best ingredients and follow time-tested recipes to create our Calcutta Sada Paan. Whether you&#8217;re a fan of masala monk calcutta pan or swad calcutta pan, our paan is sure to satisfy your cravings.\nSo why wait? Order now from Paanshala and experience the full richness and flavor of our Calcutta Sada Paan for yourself. Whether you&#8217;re a fan of traditional Kolkata paan or looking to try something new, our Calcutta Sada Paan is the perfect choice.",
        additionalInfo:
            "Sada Paan! This traditional mouth freshener is a classic blend of betel leaf, areca nut, slaked lime and a dash of cardamom that&#8217;s guaranteed to zing up your taste buds. Try our signature sada paan for an authentic experience that&#8217;s sure to leave you craving for more!",
        parentCategory: "Fresh Paan",
        subcategory: "Meetha & Sada Paan",
        isPaan: true,
    },
    {
        name: "Paan Truffle",
        description:
            "Looking for a unique and delicious dessert to spice up your party? Look no further than Paanshala&#8217;s Paan Truffle! Made with rich flavors and nuts, this delightful dessert combines all the flavors of &#8220;Meetha Paan&#8221; and chocolates for a perfect fusion of paan and chocolate.\nWith each bite, you&#8217;ll experience a blast of &#8220;Meetha Paan&#8221; that is sure to tantalize your taste buds. This dessert is a true testament to our commitment at Paanshala to provide unique and mouth-watering products that make every occasion sweeter.\nAs the best paan supplier in Delhi, we take great pride in creating high-quality desserts that are perfect for any party or celebration. Whether you&#8217;re looking to surprise your guests with a new and exciting dessert or simply treat yourself to something sweet, our Paan Truffle is the perfect choice.\nSo why wait? Order your Paan Truffle from Paanshala today and experience the full richness of paan in every bite. Trust us, it&#8217;s a gift that every paan lover will appreciate!",
        additionalInfo:
            "Paan Truffle made with rich flavours and nuts. It is made with all the flavours of “Meetha Paan” and chocolates; this is a perfect fusion of Paan and Chocolates. Experience the blast of “Meetha Paan” with each bite, a perfect delicious desert with full richness of Paan. We at Paanshala aim to provide unique and mouth-watering products to make your every occasion sweeter. Paan Truffle is a perfect gift for all paan lovers.",
        parentCategory: "Paan Truffle",
        subcategory: "",
        isPaan: true,
    },
    {
        name: "Ghundi Paan",
        description:
            "Ghundi Paan experience the taste of tradition. Perfect for any occasion, our paan is made with the finest ingredients and is sure to leave your mouth watering. The perfect blend of sweetness and spiciness will tantalize your taste buds and leave you feeling satisfied.",
        additionalInfo:
            "Ghundi Paan experience the taste of tradition. Perfect for any occasion, our paan is made with the finest ingredients and is sure to leave your mouth watering. The perfect blend of sweetness and spiciness will tantalize your taste buds and leave you feeling satisfied.",
        parentCategory: "Fresh Paan",
        subcategory: "Flavour Meetha Paan",
        isPaan: true,
    },
    {
        name: "Aam Goli",
        description:
            "Paanshala Aam Goli is made rich quality mango, extraordinary spices and flavors, Get ready for a taste explosion with Aam goli! This popular Indian candy is made with a unique blend of spices and real mango, delivering a flavor that&#8217;s both sweet and tangy. Aam goli is perfect for snacking on the go, sharing with friends, or enjoying as a special treat. So why wait? Try Aam goli today and experience a taste sensation like no other!",
        additionalInfo:
            "Paanshala Aam Goli is made rich quality mango, extraordinary spices and flavors, Get ready for a taste explosion with Aam goli! This popular Indian candy is made with a unique blend of spices and real mango, delivering a flavor that&#8217;s both sweet and tangy. Aam goli is perfect for snacking on the go, sharing with friends, or enjoying as a special treat. So why wait? Try Aam goli today and experience a taste sensation like no other!",
        parentCategory: "Candy & More",
        subcategory: "",
        isPaan: false,
    },
    {
        name: "Guava Laddu",
        description:
            "Paanshala rediscover the nostalgia of your childhood with our Guava Laddu! Wrapped in memories of traditional sweets and flavors, this delicacy is handcrafted using our family recipe passed down for generations. Each laddu is made with love and care, ensuring that every bite delivers the perfect balance of fruity guava and fragrant spices. Treat yourself or share with someone special today!",
        additionalInfo:
            "Paanshala rediscover the nostalgia of your childhood with our Guava Laddu! Wrapped in memories of traditional sweets and flavors, this delicacy is handcrafted using our family recipe passed down for generations. Each laddu is made with love and care, ensuring that every bite delivers the perfect balance of fruity guava and fragrant spices. Treat yourself or share with someone special today!",
        parentCategory: "Candy & More",
        subcategory: "",
        isPaan: false,
    },
    {
        name: "Hing Peda",
        description:
            "Paanshala Hing Peda is a Perfect appetizer, good for digestion &amp; stomach ailments. Experience the magic of Hing Peda – a sweet and savory delicacy that will take your taste buds on a journey like no other! Our Hing Peda is made from the finest ingredients and is a perfect blend of traditional Indian flavors. So whether you&#8217;re celebrating a special occasion or just want to treat yourself to something delicious, our Hing Peda is the perfect choice. Don&#8217;t miss out on this amazing treat – order now and indulge in its irresistible taste!",
        additionalInfo:
            "Paanshala Hing Peda is a Perfect appetizer, good for digestion &amp; stomach ailments. Experience the magic of Hing Peda – a sweet and savory delicacy that will take your taste buds on a journey like no other! Our Hing Peda is made from the finest ingredients and is a perfect blend of traditional Indian flavors. So whether you&#8217;re celebrating a special occasion or just want to treat yourself to something delicious, our Hing Peda is the perfect choice. Don&#8217;t miss out on this amazing treat – order now and indulge in its irresistible taste!",
        parentCategory: "Digestives",
        subcategory: "Pachak Delights",
        isPaan: false,
    },
    {
        name: "Ram Laddu",
        description:
            "Paanshala Ram Ladoo is made by tart imli and has all-time favorite ingredients. It’s great to develop a hunger and in some cases for cerebral pains. Indians utilize that ladoo later supper or lunch it’s useful for appetite.",
        additionalInfo:
            "Paanshala Ram Ladoo is made by tart imli and has all-time favorite ingredients. It’s great to develop a hunger and in some cases for cerebral pains. Indians utilize that ladoo later supper or lunch it’s useful for appetite.",
        parentCategory: "Candy & More",
        subcategory: "",
        isPaan: false,
    },
    {
        name: "Anardana Goli",
        description:
            "Paanshala Anardana Goli made with sweet, zesty taste of pomegranate? You&#8217;re going to love our Anardana goli! These delightful little treats are packed with all the juicy goodness of fresh pomegranate seeds, giving them a bold, tangy flavor that just can&#8217;t be beat. Plus, they&#8217;re made with all-natural ingredients, so you can feel good about indulging in this tasty treat. Order a batch today and get ready to enjoy the ultimate taste sensation!",
        additionalInfo:
            "Paanshala Anardana Goli made with sweet, zesty taste of pomegranate? You&#8217;re going to love our Anardana goli! These delightful little treats are packed with all the juicy goodness of fresh pomegranate seeds, giving them a bold, tangy flavor that just can&#8217;t be beat. Plus, they&#8217;re made with all-natural ingredients, so you can feel good about indulging in this tasty treat. Order a batch today and get ready to enjoy the ultimate taste sensation!",
        parentCategory: "Candy & More",
        subcategory: "",
        isPaan: false,
    },
    {
        name: "Jaljeera Goli",
        description:
            "Paanshala  Jaljeera Goli Made with a unique blend of spices and herbs, these gummies are a delightful treat for those who love a little kick in their snacks. Great for sharing or munching solo, each bite will leave you craving for more. So why wait? Grab a pack now and enjoy the explosive flavors of jaljeera!",
        additionalInfo:
            "Paanshala  Jaljeera Goli Made with a unique blend of spices and herbs, these gummies are a delightful treat for those who love a little kick in their snacks. Great for sharing or munching solo, each bite will leave you craving for more. So why wait? Grab a pack now and enjoy the explosive flavors of jaljeera!",
        parentCategory: "Candy & More",
        subcategory: "",
        isPaan: false,
    },
    {
        name: "Imli Laddu",
        description:
            "Paanshala Imli Laddu Love the sweet and sour taste of tamarind. Freshly prepared with pure tamarind paste and natural sweeteners, these bite-sized balls are a perfect balance of flavours. Whether it&#8217;s a festive occasion or a movie night, add some Imli Laddu to your platter and enjoy a burst of flavour in every bite. Order now and treat your taste buds to something delicious!",
        additionalInfo:
            "Paanshala Imli Laddu Love the sweet and sour taste of tamarind. Freshly prepared with pure tamarind paste and natural sweeteners, these bite-sized balls are a perfect balance of flavours. Whether it&#8217;s a festive occasion or a movie night, add some Imli Laddu to your platter and enjoy a burst of flavour in every bite. Order now and treat your taste buds to something delicious!",
        parentCategory: "Candy & More",
        subcategory: "",
        isPaan: false,
    },
    {
        name: "Kacha Aam Laddu",
        description:
            "Paanshala  Kacha Aam Laddu! Made with the freshest, juiciest mangoes, every bite will transport you straight to a tropical paradise. Sweet, tangy, and absolutely delicious, our kacha aam laddu are perfect as a snack or dessert. So why wait? Grab a pack today and indulge in the irresistible taste of real mangoes!",
        additionalInfo:
            "Paanshala  Kacha Aam Laddu! Made with the freshest, juiciest mangoes, every bite will transport you straight to a tropical paradise. Sweet, tangy, and absolutely delicious, our kacha aam laddu are perfect as a snack or dessert. So why wait? Grab a pack today and indulge in the irresistible taste of real mangoes!",
        parentCategory: "Candy & More",
        subcategory: "",
        isPaan: false,
    },
    {
        name: "Meetha Aam Papad",
        description:
            "Paanshala Meetha Aam Papad The perfect melange of sweet and savory, its classic lip-smacking taste. Try our Meetha Aam Papad! Made from fresh mangoes and other natural ingredients, it&#8217;s a guilt-free indulgence that you will love. With its perfect balance of sweetness and tanginess, it&#8217;s a great way to satiate your hunger and satisfy your taste buds.",
        additionalInfo:
            "Paanshala Meetha Aam Papad The perfect melange of sweet and savory, its classic lip-smacking taste. Try our Meetha Aam Papad! Made from fresh mangoes and other natural ingredients, it&#8217;s a guilt-free indulgence that you will love. With its perfect balance of sweetness and tanginess, it&#8217;s a great way to satiate your hunger and satisfy your taste buds.",
        parentCategory: "Candy & More",
        subcategory: "",
        isPaan: false,
    },
    {
        name: "Hershey`s Chocolate Paan",
        description:
            "Hershey`s Chocolate Paan! Made with the finest quality ingredients and meticulously crafted to bring you the perfect balance of Paan and chocolate flavours. Each bite is an explosion of taste and texture that will leave you craving for more. Whether you&#8217;re a Paan lover or a chocolate fanatic, our Hershey`s Chocolate Paan is the perfect treat for you. Go ahead and indulge yourself in this irresistible delight.",
        additionalInfo:
            "Hershey`s Chocolate Paan! Made with the finest quality ingredients and meticulously crafted to bring you the perfect balance of Paan and chocolate flavours. Each bite is an explosion of taste and texture that will leave you craving for more. Whether you&#8217;re a Paan lover or a chocolate fanatic, our Hershey`s Chocolate Paan is the perfect treat for you. Go ahead and indulge yourself in this irresistible delight.",
        parentCategory: "Fresh Paan",
        subcategory: "Premium Chocolate Paan",
        isPaan: true,
    },
    {
        name: "Ferrero Rocher Paan",
        description:
            "Ferrero Rocher Paan experience the perfect blend of tradition and luxury. Indulge in the exquisite combination of crispy wafer, creamy hazelnut filling, and the refreshing taste of betel leaves, all wrapped in finest quality chocolate. It&#8217;s a treat you&#8217;ll relish with every bite!",
        additionalInfo:
            "Ferrero Rocher Paan experience the perfect blend of tradition and luxury. Indulge in the exquisite combination of crispy wafer, creamy hazelnut filling, and the refreshing taste of betel leaves, all wrapped in finest quality chocolate. It&#8217;s a treat you&#8217;ll relish with every bite!",
        parentCategory: "Fresh Paan",
        subcategory: "Premium Chocolate Paan",
        isPaan: true,
    },
    {
        name: "Silk Chocolate Paan",
        description:
            "Silk Chocolate Paan is the perfect blend of innovation and tradition. This delightful creation is made with premium silk chocolate that melts in your mouth, and infused with the subtle yet distinctive taste of Paan. With every bite, savor the rich flavor and myriad textures of this one-of-a-kind treat.",
        additionalInfo:
            "Silk Chocolate Paan is the perfect blend of innovation and tradition. This delightful creation is made with premium silk chocolate that melts in your mouth, and infused with the subtle yet distinctive taste of Paan. With every bite, savor the rich flavor and myriad textures of this one-of-a-kind treat.",
        parentCategory: "Fresh Paan",
        subcategory: "Premium Chocolate Paan",
        isPaan: true,
    },
    {
        name: "Dry Paan Gulkand (Big)",
        description:
            "If you&#8217;re looking for a unique and delicious twist on traditional paan, try our Dry Paan Gulkand from Paanshala. Our gulkand in paan is the perfect combination of sweet and tangy, with a unique blend of spices and flavors that&#8217;s sure to tantalize your taste buds. Made with the finest ingredients and spices, our gulkand for paan is perfect for any occasion.\nOur Dry Paan Gulkand is available in a variety of flavors, including paan gulkand chocolate, which is a popular choice among our customers. We take great pride in our paan-making process, ensuring that each bite is as flavorful and aromatic as the last.\nAt Paanshala, we understand the importance of quality and flavor when it comes to paan. That&#8217;s why we go to great lengths to source the best ingredients and spices from around the world to create our signature paan. Our Dry Paan Gulkand is crafted with the utmost care and attention to detail, ensuring that each bite is as delicious as the last.\nWhether you&#8217;re looking for a unique addition to your paan stall for an event or simply want to try something new, our Dry Paan Gulkand is the perfect choice. So why wait? Order now from Paanshala and experience the full richness and flavor of our gulkand in paan for yourself.\n\nSize: Big",
        additionalInfo:
            "Paanshala Dry Paan Gulkand is the most famous mouth freshener of India. Elevate your snacking game with our Dry Paan Gulkand. Our handcrafted product is a delicious combination of dried betel leaves, rose petals, and gulkand that makes for the perfect after-meal treat. Plus, it&#8217;s a healthier alternative to traditional paan. So go ahead and try it out!",
        parentCategory: "Mukhwas",
        subcategory: "Meetha Dry Paan",
        isPaan: false,
    },
    {
        name: "Dry Paan Banarsi (Mini)",
        description:
            "Paanshala presents the premium quality Dry Paan Banarsi, a mouth-watering treat that is perfect for any occasion, especially weddings. Our Banarsi paan is made with the finest quality ingredients that are sourced directly from the famous paan makers of Varanasi. Each bite of our dry paan gulkand will leave you with a burst of flavors that are sure to tantalize your taste buds.\nOur dry paan Banarsi is a perfect blend of sweet and tangy flavors, and the inclusion of gulkand adds a unique twist to the traditional Banarsi paan. The dry paan is a convenient and hygienic option, making it perfect for those who want to enjoy the taste of Banarsi paan without the mess.\nPaanshala is dedicated to delivering the best quality Banarsi paan to its customers, and our dry paan Banarsi is no exception. Our paan for wedding events has been a hit among customers for years, and we take pride in being one of the most trusted brands in the market.\nIndulge in the rich flavors of Banarsi paan with our Dry Paan Banarsi. Order now from Paanshala and enjoy the authentic taste of Varanasi in the comfort of your home. So, whether it&#8217;s a wedding, a party, or just a casual get-together, our Banarsi paan will be the perfect addition to your celebration. Try our Banarsi paan today and experience the magic of Paanshala!\n\nSize: Mini",
        additionalInfo:
            "Paanshala Dry Paan Banarasi is the most famous mouth freshener of India. Discover the exotic flavors of Dry Paan Banarasi! Our traditional Indian recipe combines the goodness of betel leaf with a variety of mouth-watering ingredients such as raisins, cardamom, and cashews. Enjoy the sweet and tangy taste of our dry paan that is perfect for snacking anytime, anywhere!",
        parentCategory: "Mukhwas",
        subcategory: "Meetha Dry Paan",
        isPaan: false,
    },
    {
        name: "Dry Paan Special (Mini)",
        description:
            "Paanshala is proud to present Dry Paan Special, a delectable treat that will take your taste buds on a journey of flavors. Our Dry Paan Special is made with the finest quality ingredients and is perfect for any event or occasion, making Paanshala the go-to paan stall for events.\nOur Dry Paan Special is a unique blend of spices and herbs that are skillfully blended to create a perfect balance of flavors. With every bite, you&#8217;ll experience a burst of flavors that are sure to leave you craving for more. The inclusion of dry fruits and nuts in our Dry Paan Special adds an extra layer of crunchiness and texture that is simply irresistible.\nPaanshala is dedicated to delivering the best quality paan to its customers, and our Dry Paan Special is no exception. Made with the same attention to detail as our Dry Paan Banarsi, our Dry Paan Special is a must-try for anyone looking for a unique and authentic paan experience.\nWhether it&#8217;s a wedding, a corporate event, or a birthday party, Paanshala is the perfect choice for all your paan needs. Our Dry Paan Special is a crowd favorite, and we take pride in being one of the most trusted paan stalls for events in the market.\nSo, why wait? Order your Dry Paan Special today from Paanshala and experience the magic of our authentic and delicious paan. With every bite of our Dry Paan Special, you&#8217;ll savor the perfect blend of flavors and spices that are sure to leave you wanting more.\n\nSize: Mini",
        additionalInfo:
            "Paanshala Dry Paan Special is the most famous mouth freshener of India. Dry Paan Special is the perfect snack for those who are looking for a unique and flavorful experience! Our paan leaves are filled with a variety of delicious ingredients, including khajur, saunf, gulkand, menthol, paan leaf, elaichi and more. Not only does it taste great, but it&#8217;s also easy to carry and share with friends and family. Spice up your snack game with Dry Paan Special!",
        parentCategory: "Mukhwas",
        subcategory: "Meetha Dry Paan",
        isPaan: false,
    },
    {
        name: "Shahi Gulkand (Big)",
        description:
            "Paanshala is thrilled to present Shahi Gulkand, a royal treat for those who love the taste of gulkand in their paan. Our Shahi Gulkand is made with the highest quality ingredients, and is a perfect blend of traditional spices and aromatic rose petals, which makes it an ideal choice for any paan lover.\nOur Shahi Gulkand is a sweet and flavorful addition to our product range and has already become a customer favorite. The rich and creamy texture of the gulkand, paired with the crispy dry fruits and nuts, makes it a perfect treat to indulge in any time of the day.\nPaanshala takes pride in being one of the top paan suppliers in the market, and our Shahi Gulkand is a testament to our commitment to quality and authenticity. Our Shahi Gulkand is carefully crafted to ensure that each bite is a perfect blend of flavors that will leave you wanting more.\nPaanshala&#8217;s Shahi Gulkand is a perfect accompaniment to our Dry Paan Special, which is a unique blend of spices and herbs that are skillfully blended to create a perfect balance of flavors. Together, they make for an unforgettable paan experience.\nSo, why wait? Order your Shahi Gulkand today from Paanshala and enjoy the rich and flavorful taste of gulkand in every bite. Our commitment to quality and authenticity ensures that you get the best paan experience every time.\n\nSize: Big",
        additionalInfo:
            "Paanshala Shahi Gulkand is made with the freshest rose petals and pure sugar to create a natural and delicious treat that&#8217;s perfect for any occasion. Whether you&#8217;re looking for a quick afternoon snack or a dessert to impress your guests, our Shahi Gulkand is the perfect choice. Give it a try and experience the taste of roses like never before!",
        parentCategory: "Mukhwas",
        subcategory: "Gulkand",
        isPaan: false,
    },
    {
        name: "Shahi Gulkand (Mini)",
        description:
            "Come and experience the royalty of Shahi Gulkand, a special treat presented by Paanshala, the top paan supplier in the market for events. Our Shahi Gulkand is a perfect blend of traditional spices and aromatic rose petals, which makes it an ideal choice for any paan lover. Made with the highest quality ingredients, our Shahi Gulkand is a sweet and flavorful addition to our product range, and it has already become a customer favorite.\nPaanshala&#8217;s commitment to quality and authenticity is evident in every bite of our Shahi Gulkand. We take pride in offering a perfect blend of flavors that will leave you wanting more. Whether you are looking for a special treat for yourself or a unique gift for someone special, Paanshala&#8217;s Shahi Gulkand is the perfect choice.\nPair our Shahi Gulkand with our Dry Paan Special, a unique blend of spices and herbs that create a perfect balance of flavors, to make your paan experience unforgettable. So, don&#8217;t wait any longer, order your Shahi Gulkand today from Paanshala and enjoy the rich and flavorful taste of gulkand in every bite. Trust us, our Shahi Gulkand will exceed your expectations and leave you craving for more.\n\nSize: Mini",
        additionalInfo:
            "Paanshala Shahi Gulkand is made with the freshest rose petals and pure sugar to create a natural and delicious treat that&#8217;s perfect for any occasion. Whether you&#8217;re looking for a quick afternoon snack or a dessert to impress your guests, our Shahi Gulkand is the perfect choice. Give it a try and experience the taste of roses like never before!",
        parentCategory: "Mukhwas",
        subcategory: "Gulkand",
        isPaan: false,
    },
    {
        name: "Wafers Supari",
        description:
            "Paanshala presents Wafers Supari, a unique twist to the classic supari that will leave you craving for more. As the top paan supplier in the market, we take pride in offering the best quality products to our customers, and our Wafers Supari is no exception.\nOur Wafers Supari is a perfect blend of sweet and spicy flavors, with a crunchy texture that will tantalize your taste buds. Made with the highest quality ingredients, this delicious snack is perfect for any occasion, whether you are at home, at work, or on-the-go.\nAt Paanshala, we understand the importance of providing our customers with a diverse range of products to choose from, and our Wafers Supari is a testament to that. It pairs perfectly with our other offerings, such as the Shahi Gulkand and the Dry Paan Special, to create a unique and unforgettable paan experience.\nOur commitment to quality and authenticity is evident in every bite of our Wafers Supari. So, whether you are looking for a tasty snack or a unique gift for someone special, order your Wafers Supari from Paanshala today and experience the perfect blend of sweet and spicy flavors. Trust us, once you try our Wafers Supari, you won&#8217;t be able to resist coming back for more!\n\nWeight: 100 g",
        additionalInfo:
            "Paanshala Wafer Supari satisfy your cravings with the perfect combination of crunch and taste. Our wafer supari is made from premium betel nut and saffron roasted to perfection, and comes in a variety of delicious flavours. Try it now and experience snacking like never before!",
        parentCategory: "Mukhwas",
        subcategory: "Meethi Supari",
        isPaan: false,
    },
    {
        name: "Kesar Supari",
        description:
            "Indulge in the richness of Kesar Supari, a premium quality product by Paanshala, the top paan supplier in Delhi NCR. Made with the finest ingredients, our Kesar Supari is a perfect blend of saffron and other traditional spices that will leave you wanting more.\nOur Kesar Supari is a unique twist on the classic supari, with a sweet and aromatic flavor that will tantalize your taste buds. It is a perfect addition to our other offerings, such as the Wafers Supari and the Shahi Gulkand, to create an unforgettable paan experience.\nAt Paanshala, we take pride in offering only the best quality products to our customers. Our commitment to quality and authenticity is evident in every bite of our Kesar Supari. We understand the importance of providing our customers with a diverse range of products to choose from, and our Kesar Supari is a testament to that.\nWhether you are looking for a special treat for yourself or a unique gift for someone special, our Kesar Supari is the perfect choice. Order now from Paanshala and experience the richness and aroma of saffron in every bite. Trust us, once you try our Kesar Supari, you won&#8217;t be able to resist coming back for more.\n\nBrand: Paanshala",
        additionalInfo:
            "Paanshala Kesar Supari a delicious combination of betel nut and saffron that&#8217;s impossible to resist! These mouth-watering treats are perfect for those who enjoy a sweet and spicy flavor profile without compromising on quality. So go ahead and indulge in the rich taste of Kesar Supari!",
        parentCategory: "Mukhwas",
        subcategory: "Meethi Supari",
        isPaan: false,
    },
    {
        name: "Meethi Supari",
        description:
            "Paanshala is proud to offer our customers the finest quality Meethi Supari, made with the highest quality ingredients. Our Meethi Supari is the perfect blend of sweet and spicy, providing a deliciously satisfying taste experience.\nOur Meethi Supari is a popular addition to any paan stall for wedding, providing a perfect sweet treat for guests to enjoy. Our customers have raved about the unique blend of flavors, making it a top choice among our many offerings.\nPaanshala is dedicated to providing the best quality products to our customers, and our Meethi Supari is no exception. Made with care and attention to detail, we use only the finest ingredients to create a premium quality product that is sure to please.\nOur Meethi Supari is a perfect complement to other offerings, such as our Kesar Supari and White Saunf, to create a complete and satisfying paan experience. Whether you are a long-time fan of meethi supari or new to the taste, we are confident that you will love our high-quality product.\nOrder now from Paanshala and enjoy the perfect blend of sweetness and spice that our Meethi Supari offers. With our commitment to quality and authenticity, you can trust that every bite will be a truly satisfying experience.\n\nBrand: Paanshala",
        additionalInfo:
            "Paanshala Meethi Supari  the perfect blend of classic supari with a refreshing burst of sweetness! This soft and juicy treat is a great way to enjoy a burst of flavour without compromising on the traditional taste of supari. Try it now and take your taste buds on a sweet journey!\n&nbsp;",
        parentCategory: "Mukhwas",
        subcategory: "Meethi Supari",
        isPaan: false,
    },
    {
        name: "White Saunf",
        description:
            "Paanshala is proud to present our premium quality white sweet saunf &#8211; a classic addition to any paan stall for party or event. Our white fennel seeds are coated in a layer of delicious white sugar, providing the perfect blend of sweet and savory flavors.\nOur white sugar coated saunf is a popular choice among our customers, as it is a timeless classic that is enjoyed by all. We take great care in selecting only the highest quality ingredients to create our premium quality product.\nOur white sweet saunf is a versatile addition to any event, and is often paired with other offerings such as our Meethi Supari and Tulsi Mukhwas to create a truly satisfying paan experience. Whether enjoyed as a standalone treat or as part of a larger paan platter, our white saunf is sure to delight.\nPaanshala is dedicated to providing the best quality products to our customers, and our white sweet saunf is no exception. With our commitment to quality and authenticity, you can trust that every bite will be a truly satisfying experience.\nOrder now from Paanshala and enjoy the classic taste of our premium white sugar coated saunf. Whether for personal enjoyment or to impress your guests at your next event, our product is sure to please.\n\nBrand: Paanshala",
        additionalInfo:
            "Paanshala White Saunf is typically made of various ingredients such as fennel seeds, coconut, sesame seeds, and sugar coated with a white edible coating. It is commonly served as a digestive aid and after-meal snack in India. The taste and aroma of white saunf can vary depending on the specific recipe, but it generally has a sweet, nutty, flavor with a refreshing and cooling effect on the palate. It is often enjoyed after a meal to help freshen the breath and aid digestion.",
        parentCategory: "Mukhwas",
        subcategory: "Saunf Special",
        isPaan: false,
    },
    {
        name: "Tulsi Mukhwas",
        description:
            "Paanshala is delighted to offer our premium quality Tulsi Mukhwas &#8211; the perfect finishing touch to any paan for party or event. Our expertly crafted blend of natural ingredients provides a refreshing and aromatic flavor profile that is sure to delight your senses.\nOur Tulsi Mukhwas is a popular choice among our customers, often paired with other offerings such as our White Saunf and Shahi Mixture to create a truly satisfying paan experience. The soothing properties of tulsi provide a refreshing sensation that is sure to leave you feeling rejuvenated.\nPaanshala is dedicated to providing only the highest quality products to our customers. Our Tulsi Mukhwas is carefully crafted using only natural ingredients, ensuring a delicious and healthy addition to any paan platter.\nAs one of the top paan suppliers in Delhi NCR, we take great pride in our commitment to quality and authenticity. Our Tulsi Mukhwas is a testament to this, providing a premium quality product that is sure to impress.\nOrder now from Paanshala and enjoy the refreshing and aromatic flavor of our premium Tulsi Mukhwas. Whether for personal enjoyment or to impress your guests at your next event, our product is sure to please.\n\nBrand: Paanshala",
        additionalInfo:
            "Paanshala Tulsi mukhwas is also a popular snack to enjoy throughout the day as a healthy alternative to processed snacks. Looking for an after-meal treat that not only freshens up your breath but also aids in digestion? Try out our Tulsi Mukhwas! Made with aromatic tulsi leaves and a blend of spices, our mukhwas is the perfect addition to your daily routine. \nIt is a great source of fiber and can provide a boost of energy to help you power through your day. The main ingredient in this mukhwas is Tulsi (Holy Basil) which is considered to have many health benefits.",
        parentCategory: "Mukhwas",
        subcategory: "Natural Mukhwas",
        isPaan: false,
    },
    {
        name: "Shahi Mixture",
        description:
            "Experience the perfect blend of taste and tradition with Shahi Mixture from Paanshala &#8211; the top paan supplier in Delhi. Our Pariwar Shahi Mixture is made with the finest quality ingredients and offers a unique combination of flavors that will leave you craving for more.\nThe Shahi Mixture includes a variety of ingredients like sweet and savory spices, aromatic herbs, and dry fruits that are skillfully mixed together to create a delicious blend that is sure to impress.\nThis Shahi Mixture is a great accompaniment to any paan and can also be enjoyed on its own as a snack. Pair it with our Tulsi Mukhwas or Shahi Khus Mukhwas for a truly indulgent experience.\nPaanshala&#8217;s commitment to quality and authenticity is reflected in our Shahi Mixture as well. Our skilled team of professionals ensures that each batch is carefully prepared to deliver the perfect taste and texture.\nSo why wait? Order your Shahi Mixture from Paanshala today and savor the taste of tradition with every bite.\n\nBrand: Paanshala",
        additionalInfo:
            "Paanshala Shahi Mixture Mukhwas is made from a blend of various spices, herbs, and other ingredients. This product is typically served after meals and is known for its refreshing taste and ability to freshen breath. The Shahi Mixture Mukhwas is a delicious and beneficial product that is perfect for those looking for a natural and healthy way to freshen their breath and aid digestion after meals.",
        parentCategory: "Mukhwas",
        subcategory: "Natural Mukhwas",
        isPaan: false,
    },
    {
        name: "Shahi Khus Mukhwas",
        description:
            "Indulge in the rich and refreshing taste of Paanshala&#8217;s Shahi Khus Mukhwas, the perfect way to freshen up your breath and satisfy your cravings. Our Shahi Khus Mukhwas is a premium blend of traditional ingredients, including fennel seeds, cardamom, and khus, which gives it a unique and delicious flavor.\nAs one of the top paan suppliers in Delhi, we take pride in offering the best quality products, and our Shahi Khus Mukhwas is no exception. Each ingredient is carefully selected and blended to perfection to ensure a satisfying and flavorful experience with every bite.\nOur Shahi Khus Mukhwas is perfect for those who love pan mukhwas or are looking for a refreshing and aromatic mouth freshener. It is also available for purchase online, so you can enjoy it anytime and anywhere.\nAt Paanshala, we offer a variety of mukhwas and products, including Gujarati mukhwas, Bambaiya mouth freshener, Shahi Mixture, Rasbhari Saunf and gotli mukhwas. Whether you&#8217;re looking for a Meetha paan online or a mukhwas shop near me, Paanshala has got you covered. So, order your Shahi Khus Mukhwas today and experience the perfect blend of traditional flavors and refreshing aroma.\n\nBrand: Paanshala",
        additionalInfo:
            "Paanshala Shahi  Khus Mukhwas is a delicious and healthy alternative to traditional breath fresheners and is enjoyed by people of all ages in India and beyond. The main ingredient in Shahi Khus Mukhwas is Khus or Vetiver, which is a fragrant grass that is native to India. Other ingredients include fennel seeds, sesame seeds, coconut, cardamom, and sugar. \nThese ingredients are roasted and then mixed together to create a flavorful blend that has a sweet and refreshing taste.",
        parentCategory: "Mukhwas",
        subcategory: "Natural Mukhwas",
        isPaan: false,
    },
    {
        name: "Rasbhari Saunf",
        description:
            "Indulge in the sweet and tangy flavor of Rasbhari Saunf from Paanshala. These fennel seeds coated with a mouth-watering mixture of sweet and sour flavors will leave your taste buds wanting more. Enjoy this refreshing mukhwas after a meal or snack on it anytime for a burst of flavor.\nMade with high-quality ingredients, Rasbhari Saunf is the perfect addition to your pantry. It pairs well with other mukhwas like Shahi Khus Mukhwas and can be served at events with a paan stall for guests to enjoy.\nAt Paanshala, we take pride in providing the best quality mukhwas to our customers. Our Rasbhari Saunf is prepared with care to ensure that every seed is coated with just the right amount of sweetness and tanginess.\nOrder Rasbhari Saunf online from Paanshala and have it delivered straight to your doorstep. Try this delicious mukhwas today and experience the perfect blend of sweet and sour flavors.\n\nBrand: Paanshala",
        additionalInfo:
            "Paanshala Rasbhari Saunf is an aromatic mukhwas, best eaten after a filling meal to help you digest your food faster. Flavored to change the taste in your mouth, it gives you a much-needed freshness after your meal. Want to add a touch of sweetness to your daily routine? \nTry our Rasbhari saunf and experience the delightful taste of rasbhari  blended with fennel seeds! It&#8217;s the perfect way to enjoy a little sweetness without overindulging. So why wait? Grab a pack today and enjoy the refreshing taste of our unique and satisfying Rasbhari saunf!",
        parentCategory: "Mukhwas",
        subcategory: "Saunf Special",
        isPaan: false,
    },
    {
        name: "Paan Mukhwas",
        description:
            "Paan Mukhwas is a dry and flavorful mouth freshener that is perfect after a hearty meal. At Paanshala, we offer a variety of pan mukhwas to suit all tastes. Our pan mukhwas is made from high-quality ingredients and is blended to perfection, ensuring a delicious taste with every bite.\nOur dry paan mukhwas is the perfect combination of sweet and savory flavors that will leave your mouth feeling refreshed. Our pan mukhwas is available in a range of flavors, including banarasi paan mukhwas, Navratan Mukhwas, and paan smith mukhwas. Our mukhwas pan is also available at an affordable price point, so you can enjoy the refreshing taste of paan mukhwas without breaking the bank.\nYou can also find paan mukhwas online at Paanshala, making it easy and convenient to order your favorite mukhwas from the comfort of your own home. Our dry paan mouth freshener is also a great addition to any event, including weddings and parties. Set up a paan counter for your guests and let them enjoy the delicious taste of our paan mukhwas, Rasbhari Saunf, and Shahi Khus Mukhwas.\nOverall, our Paan Mukhwas is a must-try for anyone who loves the taste of paan. With a variety of flavors to choose from and affordable prices, Paanshala is the go-to destination for all your dry paan mukhwas needs.\n\nBrand: Paanshala",
        additionalInfo:
            "Paanshala Paan Mukhwas combines the refreshing and digestive properties of both these ingredients, making it a popular after-meal snack. It is made by wrapping saunf in a paan leaf along with various other ingredients such as gulkand, sugar, coconut, and various spices. The mixture is then folded into a small parcel and consumed as a mouth freshener.",
        parentCategory: "Mukhwas",
        subcategory: "Natural Mukhwas",
        isPaan: false,
    },
];

/* =========================================
IMPORT SCRIPT
========================================= */

const importProducts = async () => {
    try {
        for (const item of products) {
            /* =========================
                FIND PARENT CATEGORY
             ========================== */

            const parentCat = await Category.findOne({
                name: item.parentCategory.trim(),
            });

            if (!parentCat) {
                console.log(
                    `❌ Parent category not found: ${item.parentCategory}`
                );
                continue;
            }

            /* =========================
                FIND SUBCATEGORY
            ========================== */

            let categoryId;

            if (!item.subcategory || item.subcategory.trim() === "") {
                categoryId = parentCat._id;
            } else {
                const subcategory = await Category.findOne({
                    name: item.subcategory.trim(),
                    parent: parentCat._id,
                });

                if (!subcategory) {
                    console.log(
                        `❌ Subcategory not found: ${item.subcategory} for ${item.name}`
                    );
                    continue;
                }

                categoryId = subcategory._id;
            }

            /* =========================
           CHECK EXISTING PRODUCT
        ========================== */

            const existing = await Product.findOne({
                name: item.name,
            });

            if (existing) {
                console.log(`⚠️ Product already exists: ${item.name}`);
                continue;
            }

            /* =========================
           CREATE PRODUCT
        ========================== */

            const product = await Product.create({
                name: item.name,

                description: item.description,

                additionalInfo: item.additionalInfo,

                category: categoryId,

                parentCategory: parentCat._id,

                isPaan: item.isPaan,

                /* =========================
               TEMP PLACEHOLDER VALUES
            ========================== */

                images: ["https://placehold.co/600x600/png"],

                /* NON-PAAN REQUIRED */
                baseWeight: item.isPaan ? undefined : 100,

                originalPrice: item.isPaan ? undefined : 100,

                discountedPrice: item.isPaan ? undefined : 100,

                stock: 10,

                /* PAAN REQUIRED */
                variants: item.isPaan
                    ? [
                          {
                              setSize: 1,
                              originalPrice: 100,
                              discountedPrice: 100,
                              stock: 10,
                          },
                      ]
                    : [],

                seo: {
                    title: item.name,
                    description: item.description.slice(0, 150),
                    keywords: item.name.toLowerCase().split(" "),
                },
            });

            console.log(`✅ Product imported: ${product.name}`);
        }

        console.log("🎉 Import completed");

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

importProducts();
