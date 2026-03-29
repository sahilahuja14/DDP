from django.core.mail.backends.smtp import EmailBackend as DjangoEmailBackend
import ssl


class CustomEmailBackend(DjangoEmailBackend):
    def open(self):
        if self.connection:
            return False
        
        connection_params = {'timeout': self.timeout} if self.timeout else {}
        
        try:
            self.connection = self.connection_class(
                self.host, self.port, **connection_params
            )
            
            # Custom SSL context
            if self.use_tls:
                context = ssl.create_default_context()
                context.check_hostname = False
                context.verify_mode = ssl.CERT_NONE
                self.connection.starttls(context=context)
            
            if self.username and self.password:
                self.connection.login(self.username, self.password)
            
            return True
        except Exception:
            if not self.fail_silently:
                raise