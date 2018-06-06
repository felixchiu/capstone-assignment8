class Type < ActiveRecord::Base
	has_many :things, dependent: :destroy
end
