import React from 'react';

export default function ReputationGuide({ onClose }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-t-xl text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold">🛡️ Reputation System</h2>
                            <p className="opacity-90 mt-1">Become a Guardian of the Solana Ecosystem</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8">

                    {/* Badges Section */}
                    <section>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">🏆 Ranks & Badges</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="border rounded-lg p-4 flex items-center gap-3 bg-gray-50">
                                <div className="text-3xl">👶</div>
                                <div>
                                    <p className="font-bold text-gray-700">Rookie</p>
                                    <p className="text-sm text-gray-500">0 - 19 Points</p>
                                </div>
                            </div>
                            <div className="border rounded-lg p-4 flex items-center gap-3 bg-blue-50 border-blue-200">
                                <div className="text-3xl">🔭</div>
                                <div>
                                    <p className="font-bold text-blue-800">Scout</p>
                                    <p className="text-sm text-blue-600">20 - 49 Points</p>
                                </div>
                            </div>
                            <div className="border rounded-lg p-4 flex items-center gap-3 bg-purple-50 border-purple-200">
                                <div className="text-3xl">🛡️</div>
                                <div>
                                    <p className="font-bold text-purple-800">Guardian</p>
                                    <p className="text-sm text-purple-600">50 - 99 Points</p>
                                </div>
                            </div>
                            <div className="border rounded-lg p-4 flex items-center gap-3 bg-yellow-50 border-yellow-200">
                                <div className="text-3xl">👑</div>
                                <div>
                                    <p className="font-bold text-yellow-800">Legend</p>
                                    <p className="text-sm text-yellow-600">100+ Points</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* How to Earn Section */}
                    <section>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">📈 How to Earn Points</h3>
                        <div className="space-y-4">

                            <div className="flex gap-4">
                                <div className="bg-green-100 text-green-700 w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                                    +5
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800">Report a Scam</h4>
                                    <p className="text-gray-600 text-sm">
                                        Submit a verified scam report. Points are awarded after community verification.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="bg-blue-100 text-blue-700 w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                                    +1
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800">Vote Correctly</h4>
                                    <p className="text-gray-600 text-sm">
                                        Vote on reported scams. Earn points when the community consensus agrees with your vote.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="bg-purple-100 text-purple-700 w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                                    +10
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800">Maintain Security</h4>
                                    <p className="text-gray-600 text-sm">
                                        Keep your wallet risk score above 80 for 7 consecutive days. (Coming Soon)
                                    </p>
                                </div>
                            </div>

                        </div>
                    </section>

                    {/* Penalties Section */}
                    <section className="bg-red-50 rounded-lg p-4 border border-red-100">
                        <h3 className="text-lg font-bold text-red-800 mb-2">⚠️ Penalties</h3>
                        <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                            <li><strong>-10 Points:</strong> Submitting a false report (spam).</li>
                            <li><strong>-2 Points:</strong> Voting against the community consensus consistently.</li>
                        </ul>
                    </section>

                </div>

                {/* Footer */}
                <div className="bg-gray-50 p-4 rounded-b-xl text-center">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                    >
                        Got it!
                    </button>
                </div>

            </div>
        </div>
    );
}
