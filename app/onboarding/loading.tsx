export default function Loading() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-transparent">
            <div
                role="status"
                aria-label="Loading"
                className="w-10 h-10 rounded-full border-4 border-gray-300 border-t-black animate-spin"
                style={{ animationDuration: "0.6s" }}
            />
        </div>
    );
}