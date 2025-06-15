import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Shield, Lock, Eye, UserCheck } from "lucide-react"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Política de Privacidad y Tratamiento de Datos</h1>
            <p className="text-muted-foreground text-lg">
              En Zulay C respetamos y protegemos tu privacidad de acuerdo con la Ley 1581 de 2012
            </p>
            <p className="text-sm text-muted-foreground mt-2">Última actualización: Diciembre 2024</p>
          </div>

          <div className="space-y-8">
            {/* Introducción */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  1. Introducción y Responsable del Tratamiento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  <strong>Zulay C</strong> (en adelante "nosotros", "nuestro" o "la empresa"), con domicilio en
                  Colombia, es el responsable del tratamiento de sus datos personales de acuerdo con la Ley 1581 de 2012
                  de Protección de Datos Personales y sus decretos reglamentarios.
                </p>
                <p>
                  Esta política describe cómo recolectamos, usamos, almacenamos y protegemos su información personal
                  cuando utiliza nuestros servicios de comercio electrónico.
                </p>
              </CardContent>
            </Card>

            {/* Datos que recolectamos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  2. Datos Personales que Recolectamos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Datos de Identificación:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Nombre completo</li>
                    <li>Número de cédula de ciudadanía</li>
                    <li>Fecha de nacimiento</li>
                    <li>Género</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Datos de Contacto:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Dirección de correo electrónico</li>
                    <li>Número de teléfono móvil</li>
                    <li>Dirección de residencia</li>
                    <li>Ciudad y departamento</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Datos de Navegación:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Dirección IP</li>
                    <li>Tipo de navegador</li>
                    <li>Páginas visitadas</li>
                    <li>Tiempo de navegación</li>
                    <li>Cookies y tecnologías similares</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Datos Comerciales:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Historial de compras</li>
                    <li>Preferencias de productos</li>
                    <li>Métodos de pago (tokenizados)</li>
                    <li>Direcciones de envío</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Finalidades */}
            <Card>
              <CardHeader>
                <CardTitle>3. Finalidades del Tratamiento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Sus datos personales serán utilizados para las siguientes finalidades:</p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Finalidades Principales:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Procesar y gestionar sus pedidos</li>
                      <li>Facilitar el proceso de compra</li>
                      <li>Gestionar pagos y facturación</li>
                      <li>Coordinar envíos y entregas</li>
                      <li>Brindar atención al cliente</li>
                      <li>Gestionar devoluciones y garantías</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Finalidades Secundarias:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Envío de ofertas y promociones</li>
                      <li>Personalización de la experiencia</li>
                      <li>Análisis de comportamiento de compra</li>
                      <li>Mejora de nuestros servicios</li>
                      <li>Estudios de mercado</li>
                      <li>Comunicaciones comerciales</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Derechos */}
            <Card>
              <CardHeader>
                <CardTitle>4. Sus Derechos como Titular</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Como titular de los datos personales, usted tiene los siguientes derechos:</p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Derechos de Acceso y Control:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>
                        <strong>Conocer:</strong> Qué datos tenemos sobre usted
                      </li>
                      <li>
                        <strong>Actualizar:</strong> Corregir datos inexactos
                      </li>
                      <li>
                        <strong>Rectificar:</strong> Modificar información errónea
                      </li>
                      <li>
                        <strong>Suprimir:</strong> Eliminar sus datos cuando sea procedente
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Derechos de Oposición:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>
                        <strong>Revocar:</strong> Retirar su autorización
                      </li>
                      <li>
                        <strong>Solicitar prueba:</strong> De la autorización otorgada
                      </li>
                      <li>
                        <strong>Presentar quejas:</strong> Ante la SIC por infracciones
                      </li>
                      <li>
                        <strong>Acceder gratuitamente:</strong> A sus datos cada mes
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">¿Cómo ejercer sus derechos?</h4>
                  <p className="text-sm">
                    Puede ejercer sus derechos enviando un correo electrónico a <strong>privacidad@zulayc.com</strong> o
                    contactándonos a través de nuestros canales oficiales. Responderemos a su solicitud en un plazo
                    máximo de 15 días hábiles.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Seguridad */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  5. Medidas de Seguridad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Implementamos medidas técnicas, humanas y administrativas para proteger sus datos personales:</p>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h4 className="font-semibold mb-1">Encriptación SSL</h4>
                    <p className="text-xs text-muted-foreground">
                      Todas las comunicaciones están protegidas con certificados SSL
                    </p>
                  </div>

                  <div className="text-center p-4 border rounded-lg">
                    <Lock className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h4 className="font-semibold mb-1">Acceso Restringido</h4>
                    <p className="text-xs text-muted-foreground">Solo personal autorizado puede acceder a sus datos</p>
                  </div>

                  <div className="text-center p-4 border rounded-lg">
                    <Eye className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h4 className="font-semibold mb-1">Monitoreo Continuo</h4>
                    <p className="text-xs text-muted-foreground">
                      Supervisamos constantemente la seguridad de nuestros sistemas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cookies */}
            <Card>
              <CardHeader>
                <CardTitle>6. Uso de Cookies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Utilizamos cookies y tecnologías similares para mejorar su experiencia de navegación:</p>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold">Cookies Esenciales:</h4>
                    <p className="text-sm text-muted-foreground">
                      Necesarias para el funcionamiento básico del sitio web (carrito de compras, sesión de usuario).
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold">Cookies de Rendimiento:</h4>
                    <p className="text-sm text-muted-foreground">
                      Nos ayudan a entender cómo los visitantes interactúan con nuestro sitio web.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold">Cookies de Marketing:</h4>
                    <p className="text-sm text-muted-foreground">
                      Utilizadas para mostrar anuncios relevantes y medir la efectividad de nuestras campañas.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transferencias */}
            <Card>
              <CardHeader>
                <CardTitle>7. Transferencia de Datos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Sus datos personales pueden ser compartidos con terceros únicamente en los siguientes casos:</p>

                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>
                    <strong>Proveedores de servicios:</strong> Empresas de envío, procesadores de pago, proveedores de
                    tecnología
                  </li>
                  <li>
                    <strong>Autoridades competentes:</strong> Cuando sea requerido por ley o por orden judicial
                  </li>
                  <li>
                    <strong>Socios comerciales:</strong> Solo con su consentimiento expreso y para finalidades
                    específicas
                  </li>
                </ul>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm">
                    <strong>Importante:</strong> Nunca vendemos, alquilamos o compartimos sus datos personales con
                    terceros para fines comerciales sin su consentimiento explícito.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Menores de edad */}
            <Card>
              <CardHeader>
                <CardTitle>8. Menores de Edad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Nuestros servicios están dirigidos a personas mayores de 18 años. No recolectamos intencionalmente
                  datos personales de menores de edad sin el consentimiento de sus padres o tutores legales.
                </p>

                <p className="text-sm text-muted-foreground">
                  Si usted es menor de 18 años, debe contar con la supervisión y autorización de sus padres o tutores
                  legales para utilizar nuestros servicios.
                </p>
              </CardContent>
            </Card>

            {/* Contacto */}
            <Card>
              <CardHeader>
                <CardTitle>9. Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Para cualquier consulta, solicitud o reclamo relacionado con el tratamiento de sus datos personales,
                  puede contactarnos a través de:
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Datos de Contacto:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>
                        <strong>Email:</strong> privacidad@zulayc.com
                      </li>
                      <li>
                        <strong>Teléfono:</strong> +57 300 123 4567
                      </li>
                      <li>
                        <strong>Dirección:</strong> Colombia
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Horarios de Atención:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>
                        <strong>Lunes a Viernes:</strong> 8:00 AM - 6:00 PM
                      </li>
                      <li>
                        <strong>Sábados:</strong> 9:00 AM - 2:00 PM
                      </li>
                      <li>
                        <strong>Email:</strong> 24/7
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vigencia */}
            <Card>
              <CardHeader>
                <CardTitle>10. Vigencia y Modificaciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Esta política de privacidad está vigente desde diciembre de 2024 y puede ser modificada en cualquier
                  momento. Las modificaciones serán publicadas en nuestro sitio web y, cuando sea necesario, le
                  notificaremos por correo electrónico.
                </p>

                <p className="text-sm text-muted-foreground">
                  Le recomendamos revisar periódicamente esta política para mantenerse informado sobre cómo protegemos
                  su información personal.
                </p>
              </CardContent>
            </Card>
          </div>

          <Separator className="my-12" />

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Al utilizar nuestros servicios, usted acepta el tratamiento de sus datos personales de acuerdo con esta
              política de privacidad.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
