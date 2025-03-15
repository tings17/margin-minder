from rest_framework_simplejwt.authentication import JWTAuthentication

class CookiesJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        access_token = request.COOKIES.get('access_token')

        print(f"Cookies: {request.COOKIES}")
        if not access_token:
            print("no access token in cookies")
            return None
        
        try:
            validated_token = self.get_validated_token(access_token)
            user = self.get_user(validated_token)
            print(f"Authsuccess: {user.username}")
            return (user, validated_token)
        except Exception as e:
            print(f"Token error: {str(e)}")
            return None
        
