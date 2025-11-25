import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/router';

interface BookingErrorBoundaryProps {
  children: ReactNode;
  fallbackUrl?: string;
}

function BookingErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const router = useRouter();
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <Card className="w-full max-w-md mx-auto my-8">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
          <AlertCircle className="h-6 w-6 text-amber-600" />
        </div>
        <CardTitle className="text-xl">Booking Error</CardTitle>
        <CardDescription>
          There was a problem with the booking process. Your booking has not been submitted.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isDevelopment && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs font-medium text-amber-800 mb-1">Debug Info:</p>
            <pre className="text-xs text-amber-700 whitespace-pre-wrap break-words">
              {error.message}
            </pre>
          </div>
        )}
        
        <div className="flex flex-col gap-2">
          <Button 
            onClick={resetErrorBoundary}
            className="w-full"
            variant="default"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button 
            onClick={() => router.back()}
            className="w-full"
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          If the problem persists, please contact us at{' '}
          <a href="mailto:support@cebuflexitours.com" className="text-blue-600 hover:underline">
            support@cebuflexitours.com
          </a>
        </p>
      </CardContent>
    </Card>
  );
}

function logBookingError(error: Error, info: { componentStack?: string | null }) {
  // Log booking-specific errors
  if (process.env.NODE_ENV === 'development') {
    console.error('Booking Error:', error);
    console.error('Component Stack:', info.componentStack);
  }
  
  // In production, send to error tracking with booking context
  // Example: Sentry.captureException(error, { tags: { type: 'booking' }, extra: { componentStack: info.componentStack } });
}

export function BookingErrorBoundary({ children, fallbackUrl }: BookingErrorBoundaryProps) {
  const router = useRouter();
  
  return (
    <ErrorBoundary
      FallbackComponent={BookingErrorFallback}
      onError={logBookingError}
      onReset={() => {
        // Optionally redirect to a fallback URL on reset
        if (fallbackUrl) {
          router.push(fallbackUrl);
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

export default BookingErrorBoundary;

