-- Voice session tracking and conversation history
CREATE TABLE IF NOT EXISTS voice_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token_hash TEXT, -- Hash of the ephemeral token for tracking
    status TEXT CHECK (status IN ('active', 'completed', 'error')) DEFAULT 'active',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Voice conversation items/messages
CREATE TABLE IF NOT EXISTS voice_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES voice_sessions(id) ON DELETE CASCADE,
    item_type TEXT CHECK (item_type IN ('user_audio', 'user_text', 'assistant_audio', 'assistant_text', 'function_call', 'function_result')) NOT NULL,
    content JSONB NOT NULL, -- Store audio metadata, text, or function call data
    transcript TEXT, -- Auto-generated or provided transcript
    audio_duration_ms INTEGER, -- For audio items
    tokens_used INTEGER,
    sequence_number INTEGER NOT NULL, -- Order within session
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(session_id, sequence_number)
);

-- Horary questions from voice sessions
CREATE TABLE IF NOT EXISTS voice_horary_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES voice_sessions(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES voice_conversations(id) ON DELETE SET NULL,
    question_text TEXT NOT NULL,
    question_datetime TIMESTAMP WITH TIME ZONE,
    location JSONB, -- {latitude, longitude, timezone}
    querent_info JSONB DEFAULT '{}',
    chart_data JSONB, -- Generated chart data
    interpretation TEXT,
    status TEXT CHECK (status IN ('pending', 'interpreted', 'completed')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_voice_sessions_user_id ON voice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_status ON voice_sessions(status);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_created_at ON voice_sessions(created_at);

CREATE INDEX IF NOT EXISTS idx_voice_conversations_session_id ON voice_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_voice_conversations_sequence ON voice_conversations(session_id, sequence_number);
CREATE INDEX IF NOT EXISTS idx_voice_conversations_created_at ON voice_conversations(created_at);

CREATE INDEX IF NOT EXISTS idx_voice_horary_questions_session_id ON voice_horary_questions(session_id);
CREATE INDEX IF NOT EXISTS idx_voice_horary_questions_status ON voice_horary_questions(status);
CREATE INDEX IF NOT EXISTS idx_voice_horary_questions_created_at ON voice_horary_questions(created_at);

-- Row Level Security (RLS)
ALTER TABLE voice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_horary_questions ENABLE ROW LEVEL SECURITY;

-- Policies for voice_sessions
CREATE POLICY "Users can view their own voice sessions"
    ON voice_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own voice sessions"
    ON voice_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice sessions"
    ON voice_sessions FOR UPDATE
    USING (auth.uid() = user_id);

-- Policies for voice_conversations
CREATE POLICY "Users can view conversations from their sessions"
    ON voice_conversations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM voice_sessions 
            WHERE voice_sessions.id = voice_conversations.session_id 
            AND voice_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create conversations in their sessions"
    ON voice_conversations FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM voice_sessions 
            WHERE voice_sessions.id = voice_conversations.session_id 
            AND voice_sessions.user_id = auth.uid()
        )
    );

-- Policies for voice_horary_questions
CREATE POLICY "Users can view horary questions from their sessions"
    ON voice_horary_questions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM voice_sessions 
            WHERE voice_sessions.id = voice_horary_questions.session_id 
            AND voice_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create horary questions in their sessions"
    ON voice_horary_questions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM voice_sessions 
            WHERE voice_sessions.id = voice_horary_questions.session_id 
            AND voice_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update horary questions from their sessions"
    ON voice_horary_questions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM voice_sessions 
            WHERE voice_sessions.id = voice_horary_questions.session_id 
            AND voice_sessions.user_id = auth.uid()
        )
    );

-- Trigger to update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_voice_sessions_updated_at
    BEFORE UPDATE ON voice_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voice_horary_questions_updated_at
    BEFORE UPDATE ON voice_horary_questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
