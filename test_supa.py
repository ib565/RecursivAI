import socket
import dns.resolver

resolver = dns.resolver.Resolver()
resolver.nameservers = ["8.8.8.8", "1.1.1.1"]  # Google and Cloudflare DNS

try:
    answer = resolver.resolve("db.clvepnzhehvfpxtckxll.supabase.co", "A")
    print([ip.to_text() for ip in answer])
except Exception as e:
    print("DNS resolution failed:", e)
