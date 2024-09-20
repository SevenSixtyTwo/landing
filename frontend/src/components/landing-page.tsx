'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Settings, Phone, Mail, MapPin, Printer } from 'lucide-react'
import Image  from 'next/image';
import lsv from '../public/images/img3.jpg'
import energosferalogo from '../public/logoyellow.png'

import kama from '../public/partners/cuma.png'
import electromashservice from '../public/partners/elmashservice.png'
import erz from '../public/partners/erz.png'
import il from '../public/partners/il.webp'
import ruselprom from '../public/partners/ruselprom.png'
import uer from '../public/partners/uer.png'
import cumprivod from '../public/partners/cumprivod.png'
import cummashservice from '../public/partners/cummashservice.svg'

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}
const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className={`fixed top-4 right-4 p-4 rounded-md shadow-md ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
      } text-white z-50`}
    >
      {message}
    </motion.div>
  )
}

export function LandingPageComponent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isTermsOpen, setIsTermsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])
  
  const aboutRef = useRef<HTMLDivElement>(null)
  const servicesRef = useRef<HTMLDivElement>(null)
  const partnersRef = useRef<HTMLDivElement>(null)
  const contactRef = useRef<HTMLDivElement>(null)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' })
    setIsMenuOpen(false)
  }

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    message: '',
    agreeToTerms: false
  })

  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    message: '',
    agreeToTerms: '',
    contactMethod: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
    validateField(name, type === 'checkbox' ? (e.target as HTMLInputElement).checked : value)
  }

  const validateField = (name: string, value: string | boolean) => {
    let error = ''
    switch (name) {
      case 'name':
        if (typeof value === 'string' && !value.trim()) error = 'Необходимо ваше имя'
        break
        case 'email':
          if (typeof value === 'string' && value && !/\S+@\S+\.\S+/.test(value)) {
            error = 'Некорректный адрес эл. почты'
          }
          break
        case 'phone':
          if (typeof value === 'string' && value && !/^\+?[1-9]\d{1,14}$/.test(value)) {
            error = 'Некорректный номер телефона'
          }
          break
        case 'agreeToTerms':
          if (!value) error = 'Вы должны принять согласие на обработку персональных данных'
          break
        default:
          break
      }
      setFormErrors(prev => ({ ...prev, [name]: error }))
  
      if (name === 'email' || name === 'phone') {
        const otherField = name === 'email' ? 'phone' : 'email'
        const otherValue = formData[otherField as 'email' | 'phone']
        if (!value && !otherValue) {
          setFormErrors(prev => ({ ...prev, contactMethod: 'Необходим телефонный номер или адрес эл. почты' }))
        } else {
          setFormErrors(prev => ({ ...prev, contactMethod: '' }))
        }
      }
    }
  
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const isValid = Object.values(formErrors).every(error => !error) &&
                    formData.name.trim() &&
                    // formData.message.trim() &&
                    formData.agreeToTerms &&
                    (formData.email || formData.phone)
    if (isValid) {
      setIsSubmitting(true)
      try {
        const response = await fetch('http://5.140.110.167:3030/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        if (response.ok) {
          setToast({ message: "Сообщение успешно отправлено!", type: "success" })
        } else {
          throw new Error('Failed to submit form')
        }
      } catch (error) {
        setToast({ message: "Произошла ошибка при отправке сообщения. Пожалуйста, попробуйте отправить его позже.", type: "error" })
      } finally {
        setIsSubmitting(false)
      }
    } else {
      Object.keys(formData).forEach(key => validateField(key, formData[key as keyof typeof formData]))
    }
  }

  const skeuomorphicButton = `
    relative overflow-hidden bg-gradient-to-b from-yellow-400 to-yellow-500
    text-gray-800 font-bold py-2 px-4 rounded-lg
    shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_4px_rgba(0,0,0,0.3)]
    active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]
    active:translate-y-[1px]
    transition-all duration-150
    border-b-4 border-yellow-600
    disabled:opacity-50 disabled:cursor-not-allowed
  `

  const skeuomorphicInput = `
    bg-white border-2 border-gray-300 rounded-md px-4 py-2
    shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)]
    focus:shadow-[inset_0_1px_3px_rgba(0,0,0,0.2),0_0_0_3px_rgba(66,153,225,0.5)]
    focus:border-blue-500 focus:outline-none
    transition-all duration-150
  `

  return (
    <div className="min-h-screen overflow-hidden">
    <AnimatePresence>
      {toast && (
        <Toast
          key="toast"
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </AnimatePresence>
      <div 
        className="fixed top-0 left-0 w-full h-full z-0"
        style={{
          background: `
            linear-gradient(45deg, #2c3e50, #34495e),
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(255,255,255,0.05) 10px,
              rgba(255,255,255,0.05) 20px
            )
          `,
          backgroundBlendMode: 'overlay',
        }}
      >
      {/* SVG pattern for rivets */}
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <pattern id="rivets" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="20" r="2" fill="#d4af37" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#rivets)" />
      </svg>
      </div>
      <div className="relative z-10">
        <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900 bg-opacity-80 backdrop-blur-md shadow-md border-b-2 border-yellow-500">
          <nav className="container mx-auto px-4 sm:px-6 py-4">
            <div className="flex justify-between items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
              <Image
                src={energosferalogo}
                alt="Company Logo"
                width={40}
                height={40}
                className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]"
              />
              </motion.div>
              <div className="hidden md:flex space-x-6">
                {['О нас', 'Услуги', 'Партнеры', 'Контакты'].map((item, index) => (
                  <motion.button
                    key={item}
                    className={`${skeuomorphicButton} text-sm`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => scrollTo([aboutRef, servicesRef, partnersRef, contactRef][index])}
                  >
                    {item}
                  </motion.button>
                ))}
              </div>
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={skeuomorphicButton}
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            </div>
            {isMenuOpen && (
              <motion.div
                className="mt-4 md:hidden"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {['О нас', 'Услуги', 'Партнеры', 'Контакты'].map((item, index) => (
                  <Button
                    key={item}
                    variant="ghost"
                    className={`${skeuomorphicButton} block w-full text-left mb-2 text-sm`}
                    onClick={() => scrollTo([aboutRef, servicesRef, partnersRef, contactRef][index])}
                  >
                    {item}
                  </Button>
                ))}
              </motion.div>
            )}
          </nav>
        </header>

        <motion.section
          className="relative min-h-screen flex items-center justify-center text-white px-4 sm:px-6"
          style={{ opacity, scale }}
        >
          <div className="text-center bg-black bg-opacity-50 p-8 rounded-lg backdrop-blur-sm">
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-yellow-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              ООО &quot;ЭНЕРГОСФЕРА&quot;
            </motion.h1>
            <motion.p
              className="text-xl sm:text-2xl mb-8 text-gray-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Ремонт энергетического оборудования и изготовление запасных частей
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <button
                onClick={() => scrollTo(aboutRef)}
                className={`${skeuomorphicButton} text-lg px-8 py-3`}
              >
                Подробнее
              </button>
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          ref={aboutRef}
          className="py-20 bg-gray-900 bg-opacity-80"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="container mx-auto px-4 sm:px-6">
            <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center text-yellow-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">О нас</h2>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="bg-gray-900 bg-opacity-90 p-6 rounded-lg shadow-[0_4px_6px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.5)] border-2 border-yellow-400">
                <p className="text-gray-300 mb-4 leading-relaxed">
                  Наша команда опытных технических специалистов занимается быстрой и эффективной диагностикой и ремонтом ваших двигателей. Мы используем только проверенные временем технологии и качественное оборудование, чтобы обеспечить восстановление оптимальной производительности ваших двигателей и обеспечить бесперебойную работу вашего бизнеса.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  Мы предлагаем надежный сервис и приятные цены. Свяжитесь с нами для бесплатной консультации.
                </p>
              </div>
              <div className="relative h-64 md:h-auto">
              <Image
                src={lsv}
                alt="Industrial motor repair process"
                width={600}
                height={400}
                className="rounded-lg shadow-[0_4px_6px_rgba(0,0,0,0.3)] border-4 border-yellow-400 w-full h-full object-cover"
                style={{
                  boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2), 0 4px 6px rgba(0,0,0,0.3)'
                }}
              />
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          ref={servicesRef}
          className="py-20 bg-gray-800 bg-opacity-80"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="container mx-auto px-4 sm:px-6">
            <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center text-yellow-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">Наши услуги</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
              {[
                { description: 'Ремонт на собственной производственной площадке генераторов, трансформаторов, электродвигателей синхронных, асинхронных как высоковольтных выше 1000В. так и 0,4кВ. с заменой и ремонтом обмоток статора, ротора'},
                { description: 'Изготовление новых обмоток для статоров электродвигателей с применением  вакуумно-нагнетательной пропитки по системе «Монолит- 2»' },
                { description: 'Изготовление и ремонт подшипников скольжения' },
                { description: 'Восстановление посадочных поверхностей валов в номинальные размеры' },
                { description: 'Изготовление и ремонт возбудителей типа ВС(П), ВСГ, ВБД, ВТ' },
                { description: 'Изготовление лабиринтных (масляных) уплотнений' },
                { description: 'Балансировка роторов динамическая весом до 8 тон' },
                { description: 'Изготовление других запасных частей для электродвигателей и генераторов (подбандажная изоляция и распорки для синхронных роторов, контактные кольца, фиксаторы, токоподводы, щеточно-контактные аппараты, щеткодержатели, щетки электрографические' },
                { description: 'Изготовление металлоизделий с помощью плазменной резки' },
                { description: 'Поставка полупроводниковых элементов для возбудителей' },
                { description: 'Выполнение работ на территории заказчика (по согласованию объемов' },
                { description: 'Ремонт компрессоров и воздухонагнетательных агрегатов в т.ч. токарная обработка, шлифовка, балансировка валов редукторов и роторов' },
              ].map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                <Card className="bg-gray-900 bg-opacity-90 text-white shadow-[0_4px_6px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] border-2 border-yellow-400 h-full flex flex-col">
                  <CardContent className="p-6 text-center flex-grow flex flex-col justify-center">
                      <p className="text-gray-300">{service.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          ref={partnersRef}
          className="py-20 bg-gray-900 bg-opacity-80"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="container mx-auto px-4 sm:px-6">
            <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center text-yellow-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">Наши партнеры</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
              {[
                { name: kama, logo: '../public/partners/kama.png' },
                { name: electromashservice, logo: '../public/partners/electromashservice.png' },
                { name: erz, logo: '../public/partners/erz.png' },
                { name: il, logo: '../public/partners/il.webp' },
                { name: ruselprom, logo: '../public/partners/ruselprom.png' },
                { name: uer, logo: '../public/partners/uer.png' },
                { name: cumprivod, logo: '../public/partners/cumprivod.png' },
                { name: cummashservice, logo: '../public/partners/cummashservice.png' },
              ].map((partner, index) => (
                <motion.div
                  key={partner.name}
                  className="flex items-center justify-center"
                  whileHover={{ scale: 1.7 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ scale: 1 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 20
                  }}
                >
                  <div className="relative w-40 h-20 bg-slate-600 rounded-lg p-4 shadow-lg overflow-hidden">
                    <Image
                      src={partner.name}
                      alt={`${partner.name} logo`}
                      fill
                      style={{ objectFit: 'contain' }}
                      className="p-2"
                      onError={(e) => {
                        e.currentTarget.src = `/placeholder.svg?height=80&width=160&text=${partner.name}`;
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          ref={contactRef}
          className="py-20 bg-gray-800 bg-opacity-80"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="container mx-auto px-4 sm:px-6">
            <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center text-yellow-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
              Свяжитесь с нами
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-900 bg-opacity-90 p-6 rounded-lg shadow-[0_4px_6px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.1)] border-2 border-yellow-400">
                <h3 className="text-2xl font-semibold mb-6 text-yellow-400">Наши контакты</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Phone className="h-6 w-6 mr-3 text-yellow-400" />
                    <span className="text-gray-200"><p className='font-semibold'>Генеральный директор Сергей Андреевич:</p> +7 (912) 597-9517</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-6 w-6 mr-3 text-yellow-400" />
                    <span className="text-gray-200"><p className='font-semibold'>Коммерческий директор Барсуков Алексей:</p> +7 (950) 478-5051</span>
                  </div>
                  <div className="flex items-center">
                    <Printer className="h-6 w-6 mr-3 text-yellow-400" />
                    <span className="text-gray-200"><p className='font-semibold'>Факс:</p> +7 (902) 799-1385</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-6 w-6 mr-3 text-yellow-400" />
                    <span className="text-gray-200"><p className='font-semibold'>Электронная почта:</p> energosfera.requests@mail.ru</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-6 w-6 mr-3 text-yellow-400" />
                    <span className="text-gray-200 "><p className='font-semibold'>Адрес производственной площадки:</p> 618900, Пермский край, г. Лысьва, ул. Багратиона 50</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-900 bg-opacity-90 p-6 rounded-lg shadow-[0_4px_6px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.1)] border-2 border-yellow-400">
                <h3 className="text-2xl font-semibold mb-6 text-yellow-400">
                  Отсавьте сообщение и мы свяжемся с вами
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input
                      name="name"
                      placeholder="Ваше имя"
                      className={`${skeuomorphicInput} ${formErrors.name ? 'border-red-500' : ''}`}
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                    {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                  </div>
                  <div>
                    <Input
                      name="email"
                      type="email"
                      placeholder="Ваша электронная почта"
                      className={`${skeuomorphicInput} ${formErrors.email ? 'border-red-500' : ''}`}
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                    {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                  </div>
                  <div>
                    <Input
                      name="phone"
                      type="tel"
                      placeholder="Ваш телефонный номер"
                      className={`${skeuomorphicInput} ${formErrors.phone ? 'border-red-500' : ''}`}
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                    {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
                  </div>
                  {formErrors.contactMethod && <p className="text-red-500 text-sm mt-1">{formErrors.contactMethod}</p>}
                  <div>
                    <Input
                      name="companyName"
                      placeholder="Компания, которую вы представляете"
                      className={skeuomorphicInput}
                      value={formData.companyName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Textarea
                      name="message"
                      placeholder="Ваше сообщение"
                      className={`${skeuomorphicInput} ${formErrors.message ? 'border-red-500' : ''}`}
                      value={formData.message}
                      onChange={handleInputChange}
                    />
                    {formErrors.message && <p className="text-red-500 text-sm mt-1">{formErrors.message}</p>}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="agreeToTerms"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => handleInputChange({ target: { name: 'agreeToTerms', type: 'checkbox', checked } })}
                      className="border-2 border-yellow-400 text-yellow-400 focus:ring-yellow-400"
                    />
                    <label
                      htmlFor="agreeToTerms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-yellow-400"
                    >
                      Я подтеврждаю, что согласен с{' '}
                      <button
                        type="button"
                        className="underline hover:text-yellow-300"
                        onClick={() => setIsTermsOpen(true)}
                      >
                        политикой обработки персональных данных
                      </button>
                    </label>
                  </div>
                  {formErrors.agreeToTerms && <p className="text-red-500 text-sm mt-1">{formErrors.agreeToTerms}</p>}
                  <button 
                    type="submit" 
                    className={`${skeuomorphicButton} w-full text-lg`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Отправляется...' : 'Отправить'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </motion.section>

        <footer className="bg-gray-900 text-white py-8 border-t-2 border-yellow-400">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <p className="text-sm sm:text-base">&copy; 2024 ООО &quot;ЭНЕРГОСФЕРА&quot;. Все права защищены.</p>
          </div>
        </footer>
      </div>

      <Dialog open={isTermsOpen} onOpenChange={setIsTermsOpen}>
        <DialogContent className="bg-gray-900 text-white border-2 border-yellow-400 max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-yellow-400">Политика обработки персональных данных</DialogTitle>
          </DialogHeader>
          <ScrollArea className="mt-4 max-h-[60vh] pr-4">
            <DialogDescription className="text-gray-300">
              <p className="mb-4">Настоящим Я, далее –«Субъект Персональных Данных», во исполнение требований Федерального закона от 27.07.2006 г. No 152-ФЗ «О персональных данных» (с изменениями и дополнениями) свободно, своей волей и в своем интересе даю свое согласие ООО «ЭНЕРГОСФЕРА» (далее –«Оператор», юридический адрес: 618910, г. Лысьва, ул. луговая, д.20А, ОГРН 1235900005395) на обработку своих персональных данных, указанных при регистрации путем заполнения веб-формы на сайте Оператора energosfera-lysva.ru (далее –Сайт), направляемой (заполненной) с использованием Сайта, при телефонном разговоре с Оператором, а также указанных при любом ином обращении к Оператору.</p>
              <p className="mb-4">Под персональными данными я понимаю любую информацию, относящуюся ко мне как к Субъекту Персональных Данных, в том числе:
              <ul className="list-disc list-inside space-y-2">
                <li>
                  фамилию, имя, отчество (при наличии);
                </li>
                <li>
                  наименование Организации;
                </li>
                <li>
                  должность;
                </li>
                <li>
                  контактные данные (телефон, адрес электронной почты).
                </li>
              </ul>
              </p>
              <p className="mb-4">
                Под обработкой персональных данных я понимаю сбор, запись, систематизацию, накопление, уточнение, обновление, изменение, использование, передачу (предоставление, доступ), обезличивание, блокирование, удаление, уничтожение, хранение.
              </p>
              <p className="mb-4">
                Обработка персональных данных Субъекта Персональных Данных осуществляется в целях обращения по телефону или электронной почте Оператора к Субъекту Персональных Данных по заполненной заявке Субъекта Персональных Данных, направленной с использованием Сайта.
              </p>
              <p className="mb-4">
                Обработка персональных данных Субъекта Персональных Данных осуществляется в соответствии с требованиями ст. 24 Конституции Российской Федерации; Федерального закона No152-ФЗ «О персональных данных». Обработка персональных данных Субъекта Персональных Данных осуществляется с последующим направлением Субъекту Персональных Данных почтовых сообщений, СМС-уведомлений, иных уведомлений, звонков с целью подтверждения личности и идентификации Субъекта Персональных Данных при взаимоотношениях с Оператором.
              </p>
              <p className="mb-4">
                Датой выдачи согласия на обработку персональных данных Субъекта Персональных Данных является дата отправки регистрационной веб-формы с Сайта Оператора, и/или дата совершения разговора или иного обращения Субъекта Персональных Данных к Оператору. 
              </p>
              <p className="mb-4">
                Срок действия согласия на обработку персональных данных до достижения целей обработки персональных данных и/или в течение действия договора с Оператором и после его расторжения в течение срока, необходимого для исполнения Оператором обязательств по хранению документации и сведений о Субъекте Персональных Данных. Согласие на обработку персональных данных может быть отозвано на основании письменного заявления Субъекта персональных данных, поданного Оператору в соответствии с законодательством РФ.
              </p>
              <p className="mb-4">
                Обработка персональных данных Субъекта Персональных Данных может осуществляться с помощью средств автоматизации и/или без использования средств автоматизации в соответствии с действующим законодательством РФ и внутренними положениями Оператора. Оператор принимает необходимые правовые, организационные и технические меры или обеспечивает их принятие для защиты персональных данных от неправомерного или случайного доступа к ним, уничтожения, изменения, блокирования, копирования, предоставления, распространения персональных данных, а также от иных неправомерных действий в отношении персональных данных, а также принимает на себя обязательство сохранения конфиденциальности персональных данных Субъекта Персональных Данных. 
              </p>
              <p className="mb-4">
                Оператор вправе привлекать для обработки персональных данных Субъекта Персональных Данных подрядчиков, иных третьих лиц, а также вправе передавать персональные данные для обработки своим аффилированным лицам, иным третьим лицам, обеспечивая при этом принятие такими лицами соответствующих обязательств в части конфиденциальности персональных данных. 
              </p>
              <p className="mb-4">
                Я ознакомлен(а), что:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  настоящее согласие на обработку моих персональных данных, указанных при регистрации на Сайте Оператора, направляемых (заполненных) с использованием Сайта и/или предоставленных при разговоре, ином обращении Субъекта Персональных Данных к Оператору, действует до исполнения целей обработки персональных данных и/или в течение действия договора с Оператором и после его расторжения в течение срока, необходимого для исполнения Оператором обязательств по хранению документации и сведений о Субъекте Персональных Данных;
                </li>
                <li>
                  согласие на обработку персональных данных может быть отозвано мною на основании письменного заявления, направленного Оператору в произвольной форме;
                </li>
                <li>
                  предоставление мной персональных данных третьих лиц без их согласия влечет ответственность в соответствии с действующим законодательством Российской Федерации.
                </li>
              </ul>
            </DialogDescription>
          </ScrollArea>
          <DialogClose asChild>
            <Button className={`${skeuomorphicButton} mt-4`}>закрыть</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  )
}